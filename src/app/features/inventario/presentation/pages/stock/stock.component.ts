import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StockMovimientoItem, StockResumenItem } from '../../../domain/stock-movimiento.model';
import { ListarStockPaginadoUseCase } from '../../../application/use-cases/listar-stock-paginado.use-case';
import { ObtenerResumenStockUseCase } from '../../../application/use-cases/obtener-resumen-stock.use-case';
import { ListarAreasNegocioUseCase } from '../../../../catalogo/application/use-cases/area-negocio/listar-areas-negocio.use-case';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ResumenStockCardsComponent } from '../../components/resumen-stock-cards/resumen-stock-cards.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';

const NOMBRE_AREA_COLMENA = 'COLMENA';
const NOMBRE_AREA_CRISTALERIA = 'CRISTALERIA';

@Component({
  selector: 'app-stock',
  imports: [DecimalPipe, PaginationComponent, ResumenStockCardsComponent],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockComponent implements OnInit {
  private readonly listarPaginado = inject(ListarStockPaginadoUseCase);
  private readonly obtenerResumen = inject(ObtenerResumenStockUseCase);
  private readonly listarAreasNegocio = inject(ListarAreasNegocioUseCase);
  private readonly auth = inject(AuthService);

  /** Costo total, valor de venta y margen: solo con "Ver resúmenes del inventario". */
  readonly puedeVerResumen = computed(() => this.auth.permisos().has(PERMISOS.STOCK_VER_RESUMEN));

  readonly items = signal<StockMovimientoItem[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly resumen = signal<StockResumenItem | null>(null);
  readonly resumenColmena = signal<StockResumenItem | null>(null);
  readonly resumenCristaleria = signal<StockResumenItem | null>(null);
  readonly cargandoResumen = signal(false);

  readonly filtroNombre = signal('');
  readonly filtroPresentacionValor = signal('');
  readonly filtroPresentacionUnidad = signal('');
  readonly filtroPrecioVenta = signal('');
  readonly filtroActivo = signal<'' | 'true' | 'false'>('');
  readonly filtroCodigoBarra = signal('');

  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.cargar();
    if (this.puedeVerResumen()) this.cargarResumen();
  }

  aplicarFiltros(): void {
    this.page.set(0);
    this.cargar();
  }

  aplicarFiltroCodigo(): void {
    this.page.set(0);
    this.cargar();
    this.filtroCodigoBarra.set('');
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroPresentacionValor.set('');
    this.filtroPresentacionUnidad.set('');
    this.filtroPrecioVenta.set('');
    this.filtroActivo.set('');
    this.filtroCodigoBarra.set('');
    this.page.set(0);
    this.cargar();
  }

  async cargarResumen(): Promise<void> {
    this.cargandoResumen.set(true);
    try {
      const areas = await this.listarAreasNegocio.execute();
      const idColmena = areas.find(a => a.nombre.trim().toUpperCase() === NOMBRE_AREA_COLMENA)?.id;
      const idCristaleria = areas.find(a => a.nombre.trim().toUpperCase() === NOMBRE_AREA_CRISTALERIA)?.id;

      const [general, colmena, cristaleria] = await Promise.all([
        this.obtenerResumen.execute(),
        idColmena != null ? this.obtenerResumen.execute(idColmena) : Promise.resolve(null),
        idCristaleria != null ? this.obtenerResumen.execute(idCristaleria) : Promise.resolve(null),
      ]);

      this.resumen.set(general);
      this.resumenColmena.set(colmena);
      this.resumenCristaleria.set(cristaleria);
    } catch {
      // resumen es opcional, no bloquea la tabla
    } finally {
      this.cargandoResumen.set(false);
    }
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    const nombre = this.filtroNombre().trim() || undefined;
    const presentacionValorRaw = this.filtroPresentacionValor().trim();
    const presentacionValor =
      presentacionValorRaw !== '' ? parseFloat(parseFloat(presentacionValorRaw).toFixed(2)) : undefined;
    const presentacionUnidad = this.filtroPresentacionUnidad().trim() || undefined;
    const precioVentaRaw = this.filtroPrecioVenta().trim();
    const precioVenta =
      precioVentaRaw !== '' ? parseFloat(parseFloat(precioVentaRaw).toFixed(2)) : undefined;
    const activoRaw = this.filtroActivo();
    const activo = activoRaw === 'true' ? true : activoRaw === 'false' ? false : undefined;
    const codigoBarra = this.filtroCodigoBarra().trim() || undefined;

    try {
      const res = await this.listarPaginado.execute({
        page: this.page(),
        size: this.size(),
        ...(nombre ? { nombre } : {}),
        ...(presentacionValor != null && isFinite(presentacionValor) ? { presentacionValor } : {}),
        ...(presentacionUnidad ? { presentacionUnidad } : {}),
        ...(precioVenta != null && isFinite(precioVenta) ? { precioVenta } : {}),
        ...(activo !== undefined ? { activo } : {}),
        ...(codigoBarra ? { codigoBarra } : {}),
      });
      this.items.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Error al cargar el inventario. Verifique la conexión con el servidor.');
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarPagina(p: number): void {
    if (p === this.page()) return;
    this.page.set(p);
    this.cargar();
  }

  cambiarTamano(size: number): void {
    this.size.set(size);
    this.page.set(0);
    this.cargar();
  }

  cambiarFiltroActivo(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroActivo.set(select.value as '' | 'true' | 'false');
    this.aplicarFiltros();
  }

  actualizarFiltroPresentacionValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      this.filtroPresentacionValor.set(value);
    } else {
      input.value = this.filtroPresentacionValor();
    }
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

  descripcion(item: StockMovimientoItem): string {
    const presentacionValorStr =
      item.presentacionValor != null ? String(item.presentacionValor) : null;
    const presentacion = [presentacionValorStr, item.presentacionUnidad]
      .filter(v => v != null && v !== '')
      .join('');

    const partes = [item.nombre, presentacion].filter(v => v != null && v !== '');
    return partes.join(' ') || '-';
  }
}
