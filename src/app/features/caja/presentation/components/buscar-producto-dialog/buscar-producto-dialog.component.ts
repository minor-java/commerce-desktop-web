import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ListarProductosPaginadoUseCase } from '../../../../catalogo/application/use-cases/producto/listar-productos-paginado.use-case';
import { ListarItemsVentaUseCase } from '../../../application/use-cases/listar-items-venta.use-case';
import {
  ProductoPaginadoItem,
  ProductoPaginadoRequest,
  ProductoPaginadoResponse,
} from '../../../../catalogo/domain/producto-paginado.model';
import { ProductoStock } from '../../../domain/venta.model';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-buscar-producto-dialog',
  templateUrl: './buscar-producto-dialog.component.html',
  styleUrl: './buscar-producto-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class BuscarProductoDialogComponent implements OnInit {
  private readonly listarUseCase = inject(ListarProductosPaginadoUseCase);
  private readonly listarItemsVentaUseCase = inject(ListarItemsVentaUseCase);
  private readonly toast = inject(ToastService);

  readonly incluirCombos = input<boolean>(false);
  readonly soloProductos = input<boolean>(false);
  readonly productoSeleccionado = output<ProductoStock>();
  readonly cerrado = output<void>();

  readonly filtroNombre = signal('');
  readonly filtroContenido = signal('');
  readonly filtroUnidad = signal('');
  readonly paginaActual = signal(0);
  readonly cargando = signal(false);
  readonly resultado = signal<ProductoPaginadoResponse | null>(null);
  readonly error = signal<string | null>(null);

  private readonly TAMANO_PAGINA = 10;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.ejecutarBusqueda();
  }

  onFiltroNombre(event: Event): void {
    this.filtroNombre.set((event.target as HTMLInputElement).value);
    this.paginaActual.set(0);
    this.programarBusqueda();
  }

  onFiltroContenido(event: Event): void {
    this.filtroContenido.set((event.target as HTMLInputElement).value);
    this.paginaActual.set(0);
    this.programarBusqueda();
  }

  onFiltroUnidad(event: Event): void {
    this.filtroUnidad.set((event.target as HTMLInputElement).value);
    this.paginaActual.set(0);
    this.programarBusqueda();
  }

  limpiarFiltros(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.filtroNombre.set('');
    this.filtroContenido.set('');
    this.filtroUnidad.set('');
    this.paginaActual.set(0);
    this.ejecutarBusqueda();
  }

  paginaAnterior(): void {
    if (this.paginaActual() === 0) return;
    this.cancelarDebounce();
    this.paginaActual.update(p => p - 1);
    this.ejecutarBusqueda();
  }

  paginaSiguiente(): void {
    const totalPaginas = this.resultado()?.totalPages ?? 0;
    if (this.paginaActual() >= totalPaginas - 1) return;
    this.cancelarDebounce();
    this.paginaActual.update(p => p + 1);
    this.ejecutarBusqueda();
  }

  seleccionar(item: ProductoPaginadoItem): void {
    if (!item.activo) {
      this.toast.show('No se puede seleccionar un item desactivado', 'error');
      return;
    }
    const stock = item.stock ?? 0;
    if (stock <= 0) {
      this.toast.show('No hay stock disponible para este item', 'error');
      return;
    }

    if (item.tipo === 'COMBO') {
      this.productoSeleccionado.emit({
        comboId: item.comboId,
        productoId: undefined,
        nombreCompleto: item.nombre,
        precioVenta: item.precioVenta,
        stock: item.stock ?? 0,
      });
      return;
    }

    const partes: string[] = [item.nombre];
    if (item.presentacionValor != null) partes.push(String(item.presentacionValor));
    if (item.presentacionUnidad) partes.push(item.presentacionUnidad);

    this.productoSeleccionado.emit({
      productoId: item.id,
      comboId: undefined,
      nombreCompleto: partes.join(' '),
      precioVenta: item.precioVenta,
      stock,
    });
  }

  onCancelar(): void {
    this.cerrado.emit();
  }

  private programarBusqueda(): void {
    if (this.debounceTimer !== null) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.ejecutarBusqueda(), 450);
  }

  private cancelarDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private async ejecutarBusqueda(): Promise<void> {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    try {
      const contenidoRaw = this.filtroContenido();
      const presentacionValor = contenidoRaw ? parseFloat(contenidoRaw) : undefined;
      const request: ProductoPaginadoRequest = {
        page: this.paginaActual(),
        size: this.TAMANO_PAGINA,
        ...(this.filtroNombre() ? { nombre: this.filtroNombre() } : {}),
        ...(presentacionValor != null && !isNaN(presentacionValor) ? { presentacionValor } : {}),
        ...(this.filtroUnidad() ? { presentacionUnidad: this.filtroUnidad() } : {}),
      };
      const res = (this.incluirCombos() || this.soloProductos())
        ? await this.listarItemsVentaUseCase.execute(request)
        : await this.listarUseCase.execute(request);

      if (this.soloProductos()) {
        this.resultado.set({ ...res, contenido: res.contenido.filter(i => i.tipo !== 'COMBO') });
      } else {
        this.resultado.set(res);
      }
    } catch {
      this.resultado.set(null);
      this.error.set('No se pudieron cargar los productos. Intente nuevamente.');
      this.toast.show('Error al buscar items', 'error');
    } finally {
      this.cargando.set(false);
    }
  }
}
