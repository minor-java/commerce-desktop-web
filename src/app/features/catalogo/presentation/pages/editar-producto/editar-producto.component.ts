import { toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';
import { ActualizarProductoUseCase } from '../../../application/use-cases/producto/actualizar-producto.use-case';
import { VerificarCodigoBarrasUseCase } from '../../../application/use-cases/producto/verificar-codigo-barras.use-case';
import { GenerarCodigoBarrasUseCase } from '../../../application/use-cases/producto/generar-codigo-barras.use-case';
import { ListarAreasNegocioUseCase } from '../../../application/use-cases/area-negocio/listar-areas-negocio.use-case';
import { AreaNegocio } from '../../../domain/area-negocio.model';
import { NegocioService } from '../../../../../core/negocio/negocio.service';
import { ImpuestosVigentes } from '../../../../../core/negocio/negocio.model';
import { SelectorTarifaComponent } from '../../../../../shared/components/selector-tarifa/selector-tarifa.component';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { CodigosBarraPaginado, ProductoPaginadoItem } from '../../../domain/producto-paginado.model';
import { CodigosBarrasPrintListComponent } from '../../components/codigos-barras-print-list/codigos-barras-print-list.component';

interface CodigoItem {
  id?: number;
  codigo: string;
}

const PATRON_CODIGO_AUTOGENERADO = /^20\d{11}$/;

@Component({
  selector: 'app-editar-producto',
  imports: [ReactiveFormsModule, CodigosBarrasPrintListComponent, SelectorTarifaComponent],
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarProductoComponent implements OnInit {
  private readonly actualizarUseCase = inject(ActualizarProductoUseCase);
  private readonly verificarUseCase = inject(VerificarCodigoBarrasUseCase);
  private readonly generarCodigoUseCase = inject(GenerarCodigoBarrasUseCase);
  private readonly listarAreasNegocioUseCase = inject(ListarAreasNegocioUseCase);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Sin este permiso el precio se muestra pero no se puede cambiar (el backend también lo valida). */
  readonly puedeEditarPrecio = computed(() => this.auth.permisos().has(PERMISOS.PRODUCTO_EDITAR_PRECIO));
  /** Precio exacto guardado: se reenvía tal cual si no se puede editar (el campo lo redondea). */
  private precioOriginal: number | undefined;

  private productoId = 0;
  private codigosOriginales: CodigosBarraPaginado[] = [];

  readonly form = new FormGroup({
    nombre: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    presentacionValor: new FormControl('', { nonNullable: true }),
    presentacionUnidad: new FormControl('', { nonNullable: true }),
    precioVenta: new FormControl('', { nonNullable: true }),
    areaNegocioId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    tarifaImpuestoId: new FormControl<number | null>(null),
    activo: new FormControl(true, { nonNullable: true }),
  });

  readonly codigoItems = signal<CodigoItem[]>([]);
  readonly codigoInput = signal('');
  readonly verificando = signal(false);
  readonly errorCodigo = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly precioDisplay = signal('');
  readonly generandoCodigo = signal(false);
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
      // Productos antiguos sin área: si solo hay una activa, se asigna sola.
      if (areas.length === 1 && this.form.controls.areaNegocioId.value === null) {
        this.form.controls.areaNegocioId.setValue(areas[0].id);
      }
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al cargar las áreas de negocio.'), 'error');
    }
  }

  readonly tieneCodigoAutogenerado = computed(() =>
    this.codigoItems().some(item => PATRON_CODIGO_AUTOGENERADO.test(item.codigo))
  );

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const producto = (nav?.extras.state as { producto?: ProductoPaginadoItem } | undefined)?.producto;

    if (!producto) {
      this.router.navigate(['/catalogo/producto']);
      return;
    }

    this.productoId = producto.id;
    this.codigosOriginales = producto.codigosBarras;
    this.precioOriginal = producto.precioVenta ?? undefined;

    const precioInicial = producto.precioVenta != null ? Math.round(producto.precioVenta) : 0;
    this.form.setValue({
      nombre: producto.nombre,
      presentacionValor: producto.presentacionValor?.toString() ?? '',
      presentacionUnidad: producto.presentacionUnidad ?? '',
      precioVenta: precioInicial > 0 ? String(precioInicial) : '',
      areaNegocioId: producto.areaNegocioId ?? null,
      tarifaImpuestoId: producto.tarifaImpuestoId ?? null,
      activo: producto.activo,
    });
    this.precioDisplay.set(precioInicial > 0 ? precioInicial.toLocaleString('es-CO') : '');

    this.codigoItems.set(producto.codigosBarras.map(cb => ({ id: cb.id, codigo: cb.codigo })));
  }

  actualizarPrecio(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.precioDisplay.set(formatted);
    input.value = formatted;
    this.form.controls.precioVenta.setValue(raw);
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

  limpiarErrorCodigo(): void {
    this.errorCodigo.set(null);
  }

  async agregarCodigo(): Promise<void> {
    const codigo = this.codigoInput().trim();
    if (!codigo || this.verificando()) return;

    this.errorCodigo.set(null);

    if (this.codigoItems().some(ci => ci.codigo === codigo)) return;

    // Código que fue eliminado de la lista original → restaurar con su id original
    const original = this.codigosOriginales.find(cb => cb.codigo === codigo);
    if (original) {
      this.codigoItems.update(list => [...list, { id: original.id, codigo }]);
      this.codigoInput.set('');
      return;
    }

    // Código nuevo → verificar en el backend
    this.verificando.set(true);
    try {
      const { existe } = await this.verificarUseCase.execute(codigo);
      if (existe) {
        this.errorCodigo.set('Este código de barras ya está registrado en otro producto');
        return;
      }
      this.codigoItems.update(list => [...list, { codigo }]);
      this.codigoInput.set('');
    } catch (error) {
      this.errorCodigo.set(extraerMensajeError(error, 'Error al verificar el código. Intente nuevamente.'));
    } finally {
      this.verificando.set(false);
    }
  }

  async generarCodigoBarras(): Promise<void> {
    if (this.tieneCodigoAutogenerado() || this.generandoCodigo()) return;

    this.generandoCodigo.set(true);
    try {
      const { codigo } = await this.generarCodigoUseCase.execute();
      this.codigoItems.update(list => [...list, { codigo }]);
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al generar el código de barras. Intente nuevamente.'), 'error');
    } finally {
      this.generandoCodigo.set(false);
    }
  }

  eliminarCodigo(index: number): void {
    this.codigoItems.update(list => list.filter((_, i) => i !== index));
  }

  nombreEtiqueta(): string {
    const { nombre, presentacionUnidad } = this.form.getRawValue();
    const valor = this.form.controls.presentacionValor.value.trim();
    const unidad = presentacionUnidad.trim();
    const partes = [valor || null, unidad || null].filter(v => v != null);
    const presentacion = partes.length ? ` ${partes.join('')}` : '';
    return `${nombre}${presentacion}`;
  }

  codigosBarrasTexto(): string[] {
    return this.codigoItems().map(item => item.codigo);
  }

  cancelar(): void {
    this.router.navigate(['/catalogo/producto']);
  }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);

    const { nombre, presentacionUnidad, activo, precioVenta: precioVentaRaw, areaNegocioId } = this.form.getRawValue();
    const valorRaw = this.form.controls.presentacionValor.value.trim();
    const parsedValor = parseFloat(valorRaw);
    const presentacionValor = isNaN(parsedValor) ? undefined : parsedValor.toFixed(2);
    const unidad = presentacionUnidad.trim() || undefined;
    const precioRaw = precioVentaRaw.trim();

    const currentItems = this.codigoItems();
    const currentIds = new Set(currentItems.filter(ci => ci.id !== undefined).map(ci => ci.id!));
    const idsAEliminar = this.codigosOriginales
      .filter(cb => !currentIds.has(cb.id))
      .map(cb => cb.id);
    const nuevosCodigosBarras = currentItems.filter(ci => ci.id === undefined).map(ci => ci.codigo);

    try {
      await this.actualizarUseCase.execute({
        producto: {
          id: this.productoId,
          nombre,
          activo,
          presentacionValor,
          presentacionUnidad: unidad,
          precioVenta: !this.puedeEditarPrecio()
            ? this.precioOriginal
            : precioRaw !== '' ? Number(precioRaw) : undefined,
          areaNegocioId: areaNegocioId!,
          tarifaImpuestoId: this.form.controls.tarifaImpuestoId.value,
        },
        idsAEliminar,
        nuevosCodigosBarras,
      });
      this.toast.show('Producto actualizado exitosamente', 'success');
      this.router.navigate(['/catalogo/producto']);
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al actualizar el producto. Intente nuevamente.'), 'error');
    } finally {
      this.guardando.set(false);
    }
  }
}
