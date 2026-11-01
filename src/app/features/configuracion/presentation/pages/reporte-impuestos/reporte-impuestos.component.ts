import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { GenerarReporteImpuestosUseCase } from '../../../application/use-cases/generar-reporte-impuestos.use-case';
import { CLASIFICACIONES, FilaReporteImpuestos, ReporteImpuestos } from '../../../domain/impuesto.model';

type Periodo = 'mes' | 'mes-anterior' | 'bimestre' | 'bimestre-anterior' | 'cuatrimestre';

const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: 'mes', etiqueta: 'Este mes' },
  { valor: 'mes-anterior', etiqueta: 'Mes anterior' },
  { valor: 'bimestre', etiqueta: 'Bimestre actual' },
  { valor: 'bimestre-anterior', etiqueta: 'Bimestre anterior' },
  { valor: 'cuatrimestre', etiqueta: 'Cuatrimestre actual' },
];

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Rango [desde, hasta] de un periodo; los bimestres y cuatrimestres son los de la DIAN (ene-feb, ene-abr…). */
function rango(periodo: Periodo, hoy: Date): [string, string] {
  const y = hoy.getFullYear();
  const mes = hoy.getMonth();
  const fin = (anio: number, mesSiguiente: number) => new Date(anio, mesSiguiente, 0);
  switch (periodo) {
    case 'mes':
      return [iso(new Date(y, mes, 1)), iso(hoy)];
    case 'mes-anterior':
      return [iso(new Date(y, mes - 1, 1)), iso(fin(y, mes))];
    case 'bimestre': {
      const ini = mes - (mes % 2);
      return [iso(new Date(y, ini, 1)), iso(hoy)];
    }
    case 'bimestre-anterior': {
      const ini = mes - (mes % 2) - 2;
      return [iso(new Date(y, ini, 1)), iso(fin(y, ini + 2))];
    }
    case 'cuatrimestre': {
      const ini = mes - (mes % 4);
      return [iso(new Date(y, ini, 1)), iso(hoy)];
    }
  }
}

@Component({
  selector: 'app-reporte-impuestos',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './reporte-impuestos.component.html',
  styleUrl: './reporte-impuestos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteImpuestosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly useCase = inject(GenerarReporteImpuestosUseCase);

  readonly periodos = PERIODOS;

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<ReporteImpuestos | null>(null);

  readonly form = this.fb.nonNullable.group({
    desde: ['', Validators.required],
    hasta: ['', Validators.required],
  });

  readonly totalImpuesto = computed(() =>
    (this.reporte()?.totales ?? []).reduce((s, t) => s + t.netoImpuesto, 0)
  );

  ngOnInit(): void {
    this.usarPeriodo('bimestre');
  }

  usarPeriodo(periodo: Periodo): void {
    const [desde, hasta] = rango(periodo, new Date());
    this.form.setValue({ desde, hasta });
    void this.consultar();
  }

  async consultar(): Promise<void> {
    if (this.form.invalid || this.cargando()) return;
    const { desde, hasta } = this.form.getRawValue();
    if (hasta < desde) {
      this.error.set('La fecha hasta no puede ser anterior a la fecha desde');
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.reporte.set(await this.useCase.execute(desde, hasta));
    } catch (err) {
      this.reporte.set(null);
      this.error.set(extraerMensajeError(err, 'No se pudo generar el reporte'));
    } finally {
      this.cargando.set(false);
    }
  }

  etiquetaClasificacion(f: FilaReporteImpuestos): string {
    return CLASIFICACIONES.find(c => c.valor === f.clasificacion)?.etiqueta ?? f.clasificacion;
  }

  /** CSV con separador ";" y BOM para que Excel en español lo abra con tildes y columnas. */
  descargarCsv(): void {
    const r = this.reporte();
    if (!r) return;
    const num = (n: number) => n.toFixed(2).replace('.', ',');
    const filas = [
      ['Tarifa', 'Impuesto', 'Clasificación', 'Porcentaje', 'Ventas (total)', 'Ventas (base)', 'Ventas (impuesto)',
        'Devoluciones (total)', 'Devoluciones (base)', 'Devoluciones (impuesto)', 'Neto (total)', 'Neto (base)', 'Neto (impuesto)'],
      ...r.filas.map(f => [
        f.nombre, f.tipo, this.etiquetaClasificacion(f), num(f.porcentaje),
        num(f.ventasTotal), num(f.ventasBase), num(f.ventasImpuesto),
        num(f.devolucionesTotal), num(f.devolucionesBase), num(f.devolucionesImpuesto),
        num(f.netoTotal), num(f.netoBase), num(f.netoImpuesto),
      ]),
    ];
    const csv = '﻿' + filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `impuestos_${r.desde}_${r.hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
