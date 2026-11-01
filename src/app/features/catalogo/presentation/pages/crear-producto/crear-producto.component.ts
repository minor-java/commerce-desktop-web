import { toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GuardarProductoUseCase } from '../../../application/use-cases/producto/guardar-producto.use-case';
import { GenerarCodigoBarrasUseCase } from '../../../application/use-cases/producto/generar-codigo-barras.use-case';
import { ListarAreasNegocioUseCase } from '../../../application/use-cases/area-negocio/listar-areas-negocio.use-case';
import { AreaNegocio } from '../../../domain/area-negocio.model';
import { NegocioService } from '../../../../../core/negocio/negocio.service';
import { ImpuestosVigentes } from '../../../../../core/negocio/negocio.model';
import { SelectorTarifaComponent } from '../../../../../shared/components/selector-tarifa/selector-tarifa.component';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { CodigosBarrasPrintListComponent } from '../../components/codigos-barras-print-list/codigos-barras-print-list.component';

const PATRON_CODIGO_AUTOGENERADO = /^20\d{11}$/;

@Component({
  selector: 'app-crear-producto',
  imports: [ReactiveFormsModule, CodigosBarrasPrintListComponent, SelectorTarifaComponent],
  templateUrl: './crear-producto.component.html',
  styleUrl: './crear-producto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearProductoComponent implements OnInit {
  private readonly guardarUseCase = inject(GuardarProductoUseCase);
  private readonly generarCodigoUseCase = inject(GenerarCodigoBarrasUseCase);
  private readonly listarAreasNegocioUseCase = inject(ListarAreasNegocioUseCase);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    nombre: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    presentacionValor: new FormControl('', { nonNullable: true }),
    presentacionUnidad: new FormControl('', { nonNullable: true }),
    precio: new FormControl('', { nonNullable: true }),
    areaNegocioId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    tarifaImpuestoId: new FormControl<number | null>(null),
    activo: new FormControl(true, { nonNullable: true }),
  });

  readonly codigosBarras = signal<string[]>([]);
  readonly codigoInput = signal('');
  readonly generandoCodigo = signal(false);
  readonly guardando = signal(false);
  readonly precioDisplay = signal('');
  readonly areasNegocio = signal<AreaNegocio[]>([]);
  private readonly negocio = inject(NegocioService);
  readonly impuestos = signal<ImpuestosVigentes | null>(null);
  private readonly areaSeleccionadaId = toSignal(this.form.controls.areaNegocioId.valueChanges, {
    initialValue: this.form.controls.areaNegocioId.value,
  });
  /** Tarifa del área elegida: la que hereda el producto si no tiene propia. */
  readonly tarifaDelArea = computed(
    () => this.areasNegocio().find(a => a.id === this.areaSeleccionadaId())?.tarifaImpuestoId ?? null
  );

  async ngOnInit(): Promise<void> {
    try {
      void this.negocio.impuestosVigentes().then(i => this.impuestos.set(i), () => this.impuestos.set(null));
      const areas = await this.listarAreasNegocioUseCase.execute();
      this.areasNegocio.set(areas);
      // Con una sola área activa no se obliga a elegirla: queda seleccionada.
      if (areas.length === 1 && this.form.controls.areaNegocioId.value === null) {
        this.form.controls.areaNegocioId.setValue(areas[0].id);
      }
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al cargar las áreas de negocio.'), 'error');
    }
  }

  readonly tieneCodigoAutogenerado = computed(() =>
    this.codigosBarras().some(codigo => PATRON_CODIGO_AUTOGENERADO.test(codigo))
  );

  actualizarPrecio(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.precioDisplay.set(formatted);
    input.value = formatted;
    this.form.controls.precio.setValue(raw);
  }

  actualizarPresentacionValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      this.form.controls.presentacionValor.setValue(value);
    } else {
      input.value = this.form.controls.presentacionValor.value;
    }
  }

  agregarCodigo(): void {
    const codigo = this.codigoInput().trim();
    if (!codigo || this.codigosBarras().includes(codigo)) return;
    this.codigosBarras.update(list => [...list, codigo]);
    this.codigoInput.set('');
  }

  async generarCodigoBarras(): Promise<void> {
    if (this.tieneCodigoAutogenerado() || this.generandoCodigo()) return;

    this.generandoCodigo.set(true);
    try {
      const { codigo } = await this.generarCodigoUseCase.execute();
      this.codigosBarras.update(list => [...list, codigo]);
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al generar el código de barras. Intente nuevamente.'), 'error');
    } finally {
      this.generandoCodigo.set(false);
    }
  }

  eliminarCodigo(index: number): void {
    this.codigosBarras.update(list => list.filter((_, i) => i !== index));
  }

  nombreEtiqueta(): string {
    const { nombre, presentacionUnidad } = this.form.getRawValue();
    const valor = this.form.controls.presentacionValor.value.trim();
    const unidad = presentacionUnidad.trim();
    const partes = [valor || null, unidad || null].filter(v => v != null);
    const presentacion = partes.length ? ` ${partes.join('')}` : '';
    return `${nombre}${presentacion}`;
  }

  cancelar(): void {
    this.router.navigate(['/catalogo/producto']);
  }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);

    const { nombre, presentacionUnidad, activo, precio, areaNegocioId } = this.form.getRawValue();
    const valorRaw = this.form.controls.presentacionValor.value.trim();
    const parsedValor = parseFloat(valorRaw);
    const presentacionValor = isNaN(parsedValor) ? undefined : parsedValor.toFixed(2);
    const unidad = presentacionUnidad.trim() || undefined;
    const precioRaw = precio.trim();

    try {
      await this.guardarUseCase.execute({
        nombre,
        activo,
        presentacionValor,
        presentacionUnidad: unidad,
        precioVenta: precioRaw !== '' ? Number(precioRaw) : undefined,
        areaNegocioId: areaNegocioId!,
        tarifaImpuestoId: this.form.controls.tarifaImpuestoId.value,
        codigosBarras: this.codigosBarras(),
      });

      this.toast.show('Producto guardado exitosamente', 'success');
      this.router.navigate(['/catalogo/producto']);

    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al guardar el producto. Intente nuevamente.'), 'error');
    } finally {
      this.guardando.set(false);
    }
  }
}
