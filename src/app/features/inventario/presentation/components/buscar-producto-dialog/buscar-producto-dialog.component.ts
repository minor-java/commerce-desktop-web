import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  output,
  signal,
} from '@angular/core';
import { ListarProductosPaginadoUseCase } from '../../../../catalogo/application/use-cases/producto/listar-productos-paginado.use-case';
import {
  ProductoPaginadoItem,
  ProductoPaginadoRequest,
  ProductoPaginadoResponse,
} from '../../../../catalogo/domain/producto-paginado.model';
import { ProductoEscaneado } from '../../../domain/compra.model';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-buscar-producto-dialog',
  templateUrl: './buscar-producto-dialog.component.html',
  styleUrl: './buscar-producto-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class BuscarProductoDialogComponent implements OnInit {
  private readonly listarUseCase = inject(ListarProductosPaginadoUseCase);
  private readonly toast = inject(ToastService);

  readonly productoSeleccionado = output<ProductoEscaneado>();
  readonly cerrado = output<void>();

  readonly filtroNombre = signal('');
  readonly filtroContenido = signal('');
  readonly filtroUnidad = signal('');
  readonly filtroCodigoBarra = signal('');
  readonly paginaActual = signal(0);
  readonly cargando = signal(false);
  readonly resultado = signal<ProductoPaginadoResponse | null>(null);

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

  onFiltroCodigoBarra(event: Event): void {
    this.filtroCodigoBarra.set((event.target as HTMLInputElement).value);
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
    this.filtroCodigoBarra.set('');
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
      this.toast.show('No se puede seleccionar un producto desactivado', 'error');
      return;
    }

    const partes: string[] = [item.nombre];
    if (item.presentacionValor != null) partes.push(String(item.presentacionValor));
    if (item.presentacionUnidad) partes.push(item.presentacionUnidad);

    this.productoSeleccionado.emit({
      productoId: item.id,
      nombreCompleto: partes.join(' '),
      precioVenta: item.precioVenta,
    });
  }

  codigoPrincipal(item: ProductoPaginadoItem): string {
    const principal = item.codigosBarras?.find(c => c.principal);
    return (principal ?? item.codigosBarras?.[0])?.codigo ?? '—';
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
    try {
      const contenidoRaw = this.filtroContenido();
      const presentacionValor = contenidoRaw ? parseFloat(contenidoRaw) : undefined;
      const request: ProductoPaginadoRequest = {
        page: this.paginaActual(),
        size: this.TAMANO_PAGINA,
        ...(this.filtroNombre() ? { nombre: this.filtroNombre() } : {}),
        ...(presentacionValor != null && !isNaN(presentacionValor) ? { presentacionValor } : {}),
        ...(this.filtroUnidad() ? { presentacionUnidad: this.filtroUnidad() } : {}),
        ...(this.filtroCodigoBarra() ? { codigoBarra: this.filtroCodigoBarra() } : {}),
      };
      const res = await this.listarUseCase.execute(request);
      this.resultado.set(res);
    } catch {
      this.toast.show('Error al buscar productos', 'error');
    } finally {
      this.cargando.set(false);
    }
  }
}
