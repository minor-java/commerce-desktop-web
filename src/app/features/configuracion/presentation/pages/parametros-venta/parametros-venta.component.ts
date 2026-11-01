import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ParametrosVentaUseCase } from '../../../application/use-cases/parametros-venta.use-case';
import { ParametrosVenta, redondearTotal } from '../../../../../core/negocio/negocio.model';

const REDONDEOS: { valor: number; etiqueta: string }[] = [
  { valor: 0, etiqueta: 'Sin redondeo' },
  { valor: 1, etiqueta: 'Al peso (sin centavos)' },
  { valor: 50, etiqueta: 'A $50' },
  { valor: 100, etiqueta: 'A $100' },
  { valor: 500, etiqueta: 'A $500' },
  { valor: 1000, etiqueta: 'A $1.000' },
];

@Component({
  selector: 'app-parametros-venta',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './parametros-venta.component.html',
  styleUrl: './parametros-venta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametrosVentaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly useCase = inject(ParametrosVentaUseCase);

  readonly redondeos = REDONDEOS;

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly guardado = signal<ParametrosVenta | null>(null);

  readonly form = this.fb.nonNullable.group({
    redondeoTotal: [0],
    venderSinStock: [false],
    limitarDescuento: [false],
    descuentoMaximo: [10, [Validators.min(0), Validators.max(100)]],
    receptorObligatorio: [false],
    pagoEfectivo: [true],
    pagoTransferencia: [true],
  });
  private readonly valores = signal(this.form.getRawValue());

  readonly limitaDescuento = computed(() => this.valores().limitarDescuento);
  readonly sinMetodos = computed(() => !this.valores().pagoEfectivo && !this.valores().pagoTransferencia);
  /** Ejemplo del redondeo elegido con un total típico. */
  readonly ejemploRedondeo = computed(() => {
    const m = Number(this.valores().redondeoTotal);
    if (!m) return null;
    const total = 18_937.5;
    return { antes: total, despues: redondearTotal(total, m) };
  });
  readonly sinGuardar = computed(() => {
    const g = this.guardado();
    if (!g) return false;
    return JSON.stringify(this.aRequest()) !== JSON.stringify(this.normalizar(g));
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.valores.set(this.form.getRawValue()));
  }

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.aplicar(await this.useCase.obtener());
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudieron cargar los parámetros de venta'));
    } finally {
      this.cargando.set(false);
    }
  }

  private aplicar(p: ParametrosVenta): void {
    this.guardado.set(p);
    this.form.reset({
      redondeoTotal: p.redondeoTotal,
      venderSinStock: p.venderSinStock,
      limitarDescuento: p.descuentoMaximo !== null,
      descuentoMaximo: p.descuentoMaximo ?? 10,
      receptorObligatorio: p.receptorObligatorio,
      pagoEfectivo: p.pagoEfectivo,
      pagoTransferencia: p.pagoTransferencia,
    });
    this.valores.set(this.form.getRawValue());
  }

  descartar(): void {
    const g = this.guardado();
    if (g) this.aplicar(g);
  }

  private normalizar(p: ParametrosVenta): ParametrosVenta {
    return {
      redondeoTotal: Number(p.redondeoTotal),
      venderSinStock: p.venderSinStock,
      descuentoMaximo: p.descuentoMaximo === null ? null : Number(p.descuentoMaximo),
      receptorObligatorio: p.receptorObligatorio,
      pagoEfectivo: p.pagoEfectivo,
      pagoTransferencia: p.pagoTransferencia,
      responsableIva: p.responsableIva,
    };
  }

  private aRequest(): ParametrosVenta {
    const v = this.valores();
    return {
      redondeoTotal: Number(v.redondeoTotal),
      venderSinStock: v.venderSinStock,
      descuentoMaximo: v.limitarDescuento ? Number(v.descuentoMaximo) : null,
      receptorObligatorio: v.receptorObligatorio,
      pagoEfectivo: v.pagoEfectivo,
      pagoTransferencia: v.pagoTransferencia,
      responsableIva: this.guardado()?.responsableIva ?? false,
    };
  }

  async guardar(): Promise<void> {
    if (this.form.invalid || this.sinMetodos() || this.guardando()) return;
    this.guardando.set(true);
    try {
      this.aplicar(await this.useCase.guardar(this.aRequest()));
      this.toast.show('Parámetros de venta guardados', 'success');
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudieron guardar los parámetros'), 'error');
    } finally {
      this.guardando.set(false);
    }
  }
}
