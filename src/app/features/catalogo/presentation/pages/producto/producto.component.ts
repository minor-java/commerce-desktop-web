import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoPaginadoItem } from '../../../domain/producto-paginado.model';
import { ListarProductosPaginadoUseCase } from '../../../application/use-cases/producto/listar-productos-paginado.use-case';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { CodigosBarrasProductoDialogComponent } from '../../components/codigos-barras-producto-dialog/codigos-barras-producto-dialog.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';

@Component({
  selector: 'app-producto',
  imports: [DecimalPipe, PaginationComponent, CodigosBarrasProductoDialogComponent],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoComponent implements OnInit {
  private readonly listarPaginado = inject(ListarProductosPaginadoUseCase);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Con solo "Consultar productos" la pantalla es de lectura. */
  readonly puedeCrear = computed(() => this.auth.permisos().has(PERMISOS.PRODUCTO_CREAR));
  readonly puedeEditar = computed(() => this.auth.permisos().has(PERMISOS.PRODUCTO_EDITAR));

  readonly productos = signal<ProductoPaginadoItem[]>([]);
  readonly seleccionado = signal<ProductoPaginadoItem | null>(null);
  readonly productoCodigosBarras = signal<ProductoPaginadoItem | null>(null);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtroNombre = signal('');
  readonly filtroContenido = signal('');
  readonly filtroUnidad = signal('');
  readonly filtroCodigoBarra = signal('');
  readonly filtroActivo = signal<'' | 'true' | 'false'>('');
  readonly filtroPrecioVenta = signal('');

  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.cargar();
  }

  actualizarFiltroPrecioVenta(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      this.filtroPrecioVenta.set(value);
    } else {
      input.value = this.filtroPrecioVenta();
    }
  }

  actualizarFiltroContenido(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      this.filtroContenido.set(value);
    } else {
      input.value = this.filtroContenido();
    }
  }

  aplicarFiltros(): void {
    this.page.set(0);
    this.seleccionado.set(null);
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    const nombre = this.filtroNombre().trim();
    const contenidoRaw = this.filtroContenido().trim();
    const presentacionValor = contenidoRaw !== '' ? parseFloat(contenidoRaw) : undefined;
    const presentacionUnidad = this.filtroUnidad().trim() || undefined;
    const codigoBarra = this.filtroCodigoBarra().trim() || undefined;
    const activoRaw = this.filtroActivo();
    const activo = activoRaw === 'true' ? true : activoRaw === 'false' ? false : undefined;
    const precioVentaRaw = this.filtroPrecioVenta().trim();
    const precioVenta = precioVentaRaw !== '' ? parseFloat(precioVentaRaw).toFixed(2) : undefined;

    try {
      const res = await this.listarPaginado.execute({
        page: this.page(),
        size: this.size(),
        ...(nombre ? { nombre } : {}),
        ...(presentacionValor != null && isFinite(presentacionValor) ? { presentacionValor } : {}),
        ...(presentacionUnidad ? { presentacionUnidad } : {}),
        ...(codigoBarra ? { codigoBarra } : {}),
        ...(activo !== undefined ? { activo } : {}),
        ...(precioVenta !== undefined ? { precioVenta } : {}),
      });
      this.productos.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.productos.set([]);
      this.totalRows.set(0);
      this.totalPages.set(0);
      this.error.set('Error al cargar los productos. Verifique la conexión con el servidor.');
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionarFila(item: ProductoPaginadoItem): void {
    this.seleccionado.set(this.seleccionado()?.id === item.id ? null : item);
  }

  cambiarPagina(p: number): void {
    if (p === this.page()) return;
    this.page.set(p);
    this.seleccionado.set(null);
    this.cargar();
  }

  cambiarFiltroActivo(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroActivo.set(select.value as '' | 'true' | 'false');
    this.aplicarFiltros();
  }

  cambiarTamano(size: number): void {
    this.size.set(size);
    this.page.set(0);
    this.seleccionado.set(null);
    this.cargar();
  }

  editar(): void {
    const item = this.seleccionado();
    if (!item) return;
    this.router.navigate(['/catalogo/editar-producto'], { state: { producto: item } });
  }

  crearNuevoProducto(): void {
    this.router.navigate(['/catalogo/crear-producto']);
  }

  descripcion(item: ProductoPaginadoItem): string {
    const partes = [
      item.presentacionValor != null ? item.presentacionValor : null,
      item.presentacionUnidad
    ].filter(v => v != null);

    const presentacion = partes.length ? ` ${partes.join('')}` : '';

    return `${item.nombre}${presentacion}`;
  }

  abrirCodigosBarras(item: ProductoPaginadoItem): void {
    this.productoCodigosBarras.set(item);
  }

  cerrarCodigosBarras(): void {
    this.productoCodigosBarras.set(null);
  }

  codigosBarrasDe(item: ProductoPaginadoItem): string[] {
    return item.codigosBarras.map(cb => cb.codigo);
  }
}
