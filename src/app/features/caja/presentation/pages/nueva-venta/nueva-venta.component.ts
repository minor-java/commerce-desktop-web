import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BuscarProductoStockUseCase } from '../../../application/use-cases/buscar-producto-stock.use-case';
import { RegistrarVentaUseCase } from '../../../application/use-cases/registrar-venta.use-case';
import { ConsultarCajaUseCase } from '../../../application/use-cases/consultar-caja.use-case';
import { ItemVenta, ProductoStock } from '../../../domain/venta.model';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PrintService } from '../../../../../shared/services/print.service';
import { BuscarProductoDialogComponent } from '../../components/buscar-producto-dialog/buscar-producto-dialog.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';
import { NegocioService } from '../../../../../core/negocio/negocio.service';
import {
  PARAMETROS_VENTA_POR_DEFECTO,
  ParametrosVenta,
  redondearTotal,
} from '../../../../../core/negocio/negocio.model';

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';

const METODOS_PAGO: { metodo: MetodoPago; etiqueta: string; permiso: string }[] = [
  { metodo: 'EFECTIVO', etiqueta: 'Efectivo', permiso: PERMISOS.VENTA_PAGO_EFECTIVO },
  { metodo: 'TRANSFERENCIA', etiqueta: 'Transferencia', permiso: PERMISOS.VENTA_PAGO_TRANSFERENCIA },
];

@Component({
  selector: 'app-nueva-venta',
  imports: [DecimalPipe, RouterLink, BuscarProductoDialogComponent],
  templateUrl: './nueva-venta.component.html',
  styleUrl: './nueva-venta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onAtajoTecladoGlobal($event)',
  },
})
export class NuevaVentaComponent implements OnInit {
  private readonly buscarProductoUseCase = inject(BuscarProductoStockUseCase);
  private readonly registrarVentaUseCase = inject(RegistrarVentaUseCase);
  private readonly consultarCajaUseCase = inject(ConsultarCajaUseCase);
  private readonly toast = inject(ToastService);
  private readonly printService = inject(PrintService);
  private readonly auth = inject(AuthService);

  private readonly negocio = inject(NegocioService);

  /** Parámetros de venta del negocio (Configuración). El backend también los valida. */
  readonly parametros = signal<ParametrosVenta>(PARAMETROS_VENTA_POR_DEFECTO);

  /**
   * Métodos de pago que el negocio acepta Y que el rol del usuario tiene habilitados
   * (el backend también los valida).
   */
  readonly metodosHabilitados = computed(() => {
    const p = this.parametros();
    return METODOS_PAGO.filter(
      m =>
        this.auth.permisos().has(m.permiso) &&
        (m.metodo === 'EFECTIVO' ? p.pagoEfectivo : p.pagoTransferencia)
    );
  });
  readonly venderSinStock = computed(() => this.parametros().venderSinStock);
  readonly receptorObligatorio = computed(() => this.parametros().receptorObligatorio);
  readonly puedeEditarPrecio = computed(() => this.auth.permisos().has(PERMISOS.VENTA_EDITAR_PRECIO));

  readonly verificandoCaja = signal(true);
  readonly cajaDisponible = signal(false);

  private readonly codigoInputRef = viewChild<ElementRef<HTMLInputElement>>('codigoInput');
  private readonly cantidadInputRef = viewChild<ElementRef<HTMLInputElement>>('cantidadInput');
  private readonly agregarBtnRef = viewChild<ElementRef<HTMLButtonElement>>('agregarBtn');
  private readonly efectivoInputRef = viewChild<ElementRef<HTMLInputElement>>('efectivoInput');

  readonly buscando = signal(false);
  readonly registrando = signal(false);
  readonly items = signal<ItemVenta[]>([]);
  readonly metodoPago = signal<MetodoPago | null>(this.metodoInicial());
  readonly efectivoRecibido = signal<number | null>(null);
  readonly receptorNombre = signal('');

  constructor() {
    effect(() => {
      if (!this.verificandoCaja() && this.cajaDisponible()) {
        setTimeout(() => this.codigoInputRef()?.nativeElement.focus(), 50);
      }
    });
  }

  readonly dialogBuscarAbierto = signal(false);
  readonly modalAbierto = signal(false);
  readonly modalProducto = signal<ProductoStock | null>(null);
  readonly modalCantidad = signal(1);
  readonly modalPrecio = signal(0);
  readonly modalModo = signal<'agregar' | 'editar'>('agregar');
  readonly modalItemIndex = signal(-1);

  /** Suma de las líneas (precios con impuestos incluidos). */
  readonly sumaLineas = computed(() =>
    this.items().reduce((sum, item) => sum + (item.precioPersonalizado ?? item.precioVenta) * item.cantidad, 0)
  );

  /** Total a cobrar: la suma redondeada según los parámetros de venta (igual que el backend). */
  readonly total = computed(() => redondearTotal(this.sumaLineas(), this.parametros().redondeoTotal));
  readonly ajusteRedondeo = computed(() => this.total() - this.sumaLineas());

  /** Precio mínimo del ítem del modal según el descuento máximo del negocio. */
  readonly precioMinimoModal = computed(() => {
    const base = this.modalProducto()?.precioVenta ?? 0;
    const max = this.parametros().descuentoMaximo;
    if (max === null) return 1;
    return Math.max(1, Math.ceil(base * (1 - max / 100)));
  });

  /** Tope de cantidad del modal: el stock, salvo que el negocio permita vender sin stock. */
  private maxCantidad(producto: ProductoStock | null): number {
    if (this.venderSinStock() && !producto?.comboId) return Number.MAX_SAFE_INTEGER;
    return producto?.stock ?? 1;
  }

  readonly maxCantidadModal = computed(() => {
    const max = this.maxCantidad(this.modalProducto());
    return max === Number.MAX_SAFE_INTEGER ? null : max;
  });

  readonly cambio = computed(() => {
    const ef = this.efectivoRecibido();
    return ef === null ? null : ef - this.total();
  });

  ngOnInit(): void {
    void this.verificarCaja();
    void this.cargarParametros();
  }

  private async cargarParametros(): Promise<void> {
    try {
      this.parametros.set(await this.negocio.parametrosVenta());
    } catch {
      // Sin conexión con la configuración se trabaja con los valores por defecto;
      // el backend aplica los reales al registrar la venta.
    }
    const actual = this.metodoPago();
    if (!actual || !this.metodosHabilitados().some(m => m.metodo === actual)) {
      this.metodoPago.set(this.metodoInicial());
    }
  }

  private async verificarCaja(): Promise<void> {
    this.verificandoCaja.set(true);
    try {
      const caja = await this.consultarCajaUseCase.execute();
      this.cajaDisponible.set(caja !== null);
    } catch {
      this.cajaDisponible.set(false);
    } finally {
      this.verificandoCaja.set(false);
    }
  }

  onAtajoTecladoGlobal(event: KeyboardEvent): void {
    if (event.key === 'F9') {
      event.preventDefault();
      this.abrirCajon();
    }
  }

  private abrirCajon(): void {
    if (!this.cajaDisponible()) return;
    this.printService.abrirCajon().catch(() => {
      this.toast.show('No se pudo conectar con la impresora.', 'error');
    });
  }

  onCodigoKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.buscar();
    }
  }

  abrirDialogBuscar(): void {
    if (!this.cajaDisponible()) return;
    this.dialogBuscarAbierto.set(true);
  }

  cerrarDialogBuscar(): void {
    this.dialogBuscarAbierto.set(false);
    setTimeout(() => this.codigoInputRef()?.nativeElement.focus(), 50);
  }

  onProductoSeleccionadoDesdeDialog(producto: ProductoStock): void {
    this.cerrarDialogBuscar();
    this.abrirModalAgregar(producto);
  }

  async buscar(): Promise<void> {
    if (!this.cajaDisponible()) return;
    const inputEl = this.codigoInputRef()?.nativeElement;
    const codigo = (inputEl?.value ?? '').trim();
    if (!codigo || this.buscando()) return;

    this.buscando.set(true);
    try {
      const producto = await this.buscarProductoUseCase.execute(codigo);

      const esCombo = !!producto.comboId;
      const maximo = this.maxCantidad(producto);

      if (maximo <= 0) {
        this.toast.show(`"${producto.nombreCompleto}" no tiene stock disponible`, 'error');
        return;
      }
      const existingIndex = esCombo
        ? this.items().findIndex(i => i.comboId === producto.comboId)
        : this.items().findIndex(i => i.productoId === producto.productoId);

      if (existingIndex >= 0) {
        const item = this.items()[existingIndex];
        if (item.cantidad >= maximo) {
          this.toast.show(`Stock máximo alcanzado para "${producto.nombreCompleto}"`, 'error');
        } else {
          this.items.update(list =>
            list.map((it, i) => (i === existingIndex ? { ...it, cantidad: it.cantidad + 1 } : it))
          );
        }
      } else {
        this.items.update(list => [
          ...list,
          {
            productoId: esCombo ? undefined : producto.productoId,
            comboId: esCombo ? producto.comboId : undefined,
            nombreCompleto: producto.nombreCompleto,
            precioVenta: producto.precioVenta,
            stock: producto.stock,
            cantidad: 1,
          },
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar el producto';
      this.toast.show(msg, 'error');
    } finally {
      this.buscando.set(false);
      if (inputEl) inputEl.value = '';
      setTimeout(() => inputEl?.focus(), 50);
    }
  }

  abrirModalAgregar(producto: ProductoStock): void {
    this.modalProducto.set(producto);
    this.modalCantidad.set(1);
    this.modalPrecio.set(producto.precioVenta);
    this.modalModo.set('agregar');
    this.modalItemIndex.set(-1);
    this.modalAbierto.set(true);
    setTimeout(() => this.cantidadInputRef()?.nativeElement.focus(), 50);
  }

  abrirModalEditar(index: number): void {
    const item = this.items()[index];
    this.modalProducto.set({
      productoId: item.productoId,
      comboId: item.comboId,
      nombreCompleto: item.nombreCompleto,
      precioVenta: item.precioVenta,
      stock: item.stock,
    });
    this.modalCantidad.set(item.cantidad);
    this.modalPrecio.set(item.precioPersonalizado ?? item.precioVenta);
    this.modalModo.set('editar');
    this.modalItemIndex.set(index);
    this.modalAbierto.set(true);
    setTimeout(() => this.cantidadInputRef()?.nativeElement.focus(), 50);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.modalProducto.set(null);
    setTimeout(() => this.codigoInputRef()?.nativeElement.focus(), 50);
  }

  confirmarModal(): void {
    const producto = this.modalProducto();
    if (!producto) return;

    const cantidad = this.modalCantidad();
    const maximo = this.maxCantidad(producto);
    if (cantidad < 1 || cantidad > maximo) return;

    // Sin permiso de editar precio siempre se vende al precio base.
    const precio = this.puedeEditarPrecio() ? this.modalPrecio() : producto.precioVenta;
    if (precio <= 0 || precio > producto.precioVenta) return;
    if (precio < this.precioMinimoModal()) {
      this.toast.show(
        `El descuento supera el máximo permitido. Precio mínimo: $ ${this.precioMinimoModal().toLocaleString('es-CO')}`,
        'error'
      );
      return;
    }
    const precioPersonalizado = precio !== producto.precioVenta ? precio : undefined;

    if (this.modalModo() === 'agregar') {
      const existingIndex = producto.comboId
        ? this.items().findIndex(i => i.comboId === producto.comboId)
        : this.items().findIndex(i => i.productoId === producto.productoId);

      if (existingIndex >= 0) {
        const nuevaCantidad = this.items()[existingIndex].cantidad + cantidad;
        if (nuevaCantidad > maximo) {
          this.toast.show(`Stock máximo alcanzado para "${producto.nombreCompleto}"`, 'error');
          this.cerrarModal();
          return;
        }
        this.items.update(list =>
          list.map((item, i) => (i === existingIndex ? { ...item, cantidad: nuevaCantidad } : item))
        );
      } else {
        this.items.update(list => [
          ...list,
          {
            productoId: producto.comboId ? undefined : producto.productoId,
            comboId: producto.comboId ?? undefined,
            nombreCompleto: producto.nombreCompleto,
            precioVenta: producto.precioVenta,
            precioPersonalizado,
            stock: producto.stock,
            cantidad,
          },
        ]);
      }
    } else {
      const index = this.modalItemIndex();
      this.items.update(list =>
        list.map((item, i) => (i === index ? { ...item, cantidad, precioPersonalizado } : item))
      );
    }

    this.cerrarModal();
  }

  onPrecioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value);
    const base = this.modalProducto()?.precioVenta ?? 0;
    if (isNaN(val) || val <= 0) {
      this.modalPrecio.set(1);
      return;
    }
    if (val > base) {
      this.modalPrecio.set(base);
      input.value = String(base);
      return;
    }
    this.modalPrecio.set(val);
  }

  onCantidadInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    const maximo = this.maxCantidad(this.modalProducto());
    if (isNaN(value) || value < 1) value = 1;
    if (value > maximo) value = Math.floor(maximo);
    input.value = String(value);
    this.modalCantidad.set(value);
  }

  onCantidadKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault();
      this.agregarBtnRef()?.nativeElement.focus();
    }
  }

  onAgregarKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.confirmarModal();
    } else if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.cantidadInputRef()?.nativeElement.focus();
    }
  }

  eliminarItem(index: number): void {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  /** Efectivo si está habilitado; si no, el primero disponible. */
  private metodoInicial(): MetodoPago | null {
    return this.metodosHabilitados()[0]?.metodo ?? null;
  }

  onMetodoPagoChange(metodo: MetodoPago): void {
    this.metodoPago.set(metodo);
    this.efectivoRecibido.set(null);
  }

  onEfectivoKeydown(event: KeyboardEvent): void {
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!controlKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onEfectivoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    if (raw === '') {
      this.efectivoRecibido.set(null);
      return;
    }
    const num = parseInt(raw, 10);
    input.value = num.toLocaleString('es-CO');
    this.efectivoRecibido.set(num);
  }

  onReceptorInput(event: Event): void {
    this.receptorNombre.set((event.target as HTMLInputElement).value);
  }

  async registrarVenta(): Promise<void> {
    if (this.items().length === 0) {
      this.toast.show('Agregue al menos un producto antes de registrar', 'error');
      return;
    }
    if (this.registrando()) return;
    const metodoPago = this.metodoPago();
    if (!metodoPago) {
      this.toast.show('Su usuario no tiene métodos de pago habilitados. Contacte al administrador.', 'error');
      return;
    }

    const receptor = this.receptorNombre().trim();
    if (this.receptorObligatorio() && !receptor) {
      this.toast.show('Indique a quién va dirigida la venta', 'error');
      return;
    }

    this.registrando.set(true);
    try {
      const resultado = await this.registrarVentaUseCase.execute({
        metodoPago,
        detalles: this.items().map(item => ({
          ...(item.comboId ? { comboId: item.comboId } : { productoId: item.productoId }),
          cantidad: item.cantidad,
          ...(item.precioPersonalizado !== undefined ? { precioUnitario: item.precioPersonalizado } : {}),
        })),
        ...(receptor ? { receptorNombre: receptor } : {}),
      });

      this.toast.show(
        `Venta registrada — Total: $ ${resultado.total.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`,
        'success'
      );

      this.items.set([]);
      this.efectivoRecibido.set(null);
      this.metodoPago.set(this.metodoInicial());
      this.receptorNombre.set('');

      const efEl = this.efectivoInputRef()?.nativeElement;
      if (efEl) efEl.value = '';

      setTimeout(() => this.codigoInputRef()?.nativeElement.focus(), 50);

      if (resultado.ticket && resultado.ticket.length > 0) {
        this.printService.imprimirTicket(resultado.ticket).catch(() => {
          this.toast.show('No se pudo conectar con la impresora.', 'error');
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la venta. Intente nuevamente.';
      this.toast.show(msg, 'error');
    } finally {
      this.registrando.set(false);
    }
  }
}
