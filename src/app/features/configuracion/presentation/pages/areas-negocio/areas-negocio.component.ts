import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ListarAreasNegocioConfigUseCase } from '../../../application/use-cases/listar-areas-negocio-config.use-case';
import { GuardarAreaNegocioUseCase } from '../../../application/use-cases/guardar-area-negocio.use-case';
import { EliminarAreaNegocioUseCase } from '../../../application/use-cases/eliminar-area-negocio.use-case';
import { AreaNegocioConfig } from '../../../domain/area-negocio.model';
import { NegocioService } from '../../../../../core/negocio/negocio.service';
import { ImpuestosVigentes } from '../../../../../core/negocio/negocio.model';

@Component({
  selector: 'app-areas-negocio',
  imports: [ReactiveFormsModule],
  templateUrl: './areas-negocio.component.html',
  styleUrl: './areas-negocio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrarDialogos()' },
})
export class AreasNegocioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly listarUseCase = inject(ListarAreasNegocioConfigUseCase);
  private readonly guardarUseCase = inject(GuardarAreaNegocioUseCase);
  private readonly eliminarUseCase = inject(EliminarAreaNegocioUseCase);
  private readonly negocio = inject(NegocioService);

  /** null mientras carga o si falla: el selector de tarifa se oculta. */
  readonly impuestos = signal<ImpuestosVigentes | null>(null);

  private readonly nombreInput = viewChild<ElementRef<HTMLInputElement>>('nombreInput');

  readonly areas = signal<AreaNegocioConfig[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** undefined = cerrado, null = nueva área. */
  readonly areaEnEdicion = signal<AreaNegocioConfig | null | undefined>(undefined);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);

  readonly areaAEliminar = signal<AreaNegocioConfig | null>(null);
  readonly eliminando = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    activo: [true],
    tarifaImpuestoId: [null as number | null],
  });

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [areas, impuestos] = await Promise.all([
        this.listarUseCase.execute(),
        this.negocio.impuestosVigentes().catch(() => null),
      ]);
      this.areas.set(areas);
      this.impuestos.set(impuestos);
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudieron cargar las áreas de negocio'));
    } finally {
      this.cargando.set(false);
    }
  }

  nueva(): void {
    this.abrir(null);
  }

  editar(area: AreaNegocioConfig): void {
    this.abrir(area);
  }

  private abrir(area: AreaNegocioConfig | null): void {
    this.form.reset({
      nombre: area?.nombre ?? '',
      activo: area?.activo ?? true,
      tarifaImpuestoId: area?.tarifaImpuestoId ?? null,
    });
    this.errorFormulario.set(null);
    this.areaEnEdicion.set(area);
    setTimeout(() => this.nombreInput()?.nativeElement.focus());
  }

  mostrarErrorNombre(): boolean {
    const c = this.form.controls.nombre;
    return c.invalid && c.touched;
  }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    const area = this.areaEnEdicion();
    if (this.form.invalid || this.guardando() || area === undefined) return;

    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.errorFormulario.set(null);
    try {
      const guardada = await this.guardarUseCase.execute(area?.id ?? null, {
        nombre: v.nombre.trim(),
        activo: v.activo,
        tarifaImpuestoId: v.tarifaImpuestoId,
      });
      this.areas.update(lista =>
        (area ? lista.map(a => (a.id === guardada.id ? guardada : a)) : [...lista, guardada]).sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        )
      );
      this.toast.show(`Área ${guardada.nombre} ${area ? 'actualizada' : 'creada'}`, 'success');
      this.areaEnEdicion.set(undefined);
    } catch (err) {
      this.errorFormulario.set(extraerMensajeError(err, 'No se pudo guardar el área de negocio'));
    } finally {
      this.guardando.set(false);
    }
  }

  confirmarEliminar(area: AreaNegocioConfig): void {
    this.areaAEliminar.set(area);
  }

  async eliminar(): Promise<void> {
    const area = this.areaAEliminar();
    if (!area) return;
    this.eliminando.set(true);
    try {
      await this.eliminarUseCase.execute(area.id);
      this.areas.update(lista => lista.filter(a => a.id !== area.id));
      this.toast.show(`Área ${area.nombre} eliminada`, 'success');
      this.areaAEliminar.set(null);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo eliminar el área de negocio'), 'error');
    } finally {
      this.eliminando.set(false);
    }
  }

  /** Nombre de la tarifa del área, o la por defecto que hereda. */
  tarifaTexto(area: AreaNegocioConfig): string {
    const imp = this.impuestos();
    if (!imp) return '';
    if (area.tarifaImpuestoId == null) return `Por defecto (${this.nombreTarifa(imp.tarifaPorDefectoId)})`;
    return this.nombreTarifa(area.tarifaImpuestoId);
  }

  nombreTarifaPorDefecto(): string {
    return this.nombreTarifa(this.impuestos()?.tarifaPorDefectoId ?? null);
  }

  private nombreTarifa(id: number | null): string {
    return this.impuestos()?.tarifas.find(t => t.id === id)?.nombre ?? '—';
  }

  cerrarDialogos(): void {
    if (!this.guardando()) this.areaEnEdicion.set(undefined);
    if (!this.eliminando()) this.areaAEliminar.set(null);
  }
}
