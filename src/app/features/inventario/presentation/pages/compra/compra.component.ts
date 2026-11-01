import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CompraDetalle, CompraItem } from '../../../domain/compra.model';
import { ListarComprasPaginadoUseCase } from '../../../application/use-cases/listar-compras-paginado.use-case';
import { ConsultarDetalleCompraUseCase } from '../../../application/use-cases/consultar-detalle-compra.use-case';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';

@Component({
  selector: 'app-compra',
  imports: [DecimalPipe, DatePipe, PaginationComponent],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompraComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Con solo "Consultar compras" no se muestra el registro de compras. */
  readonly puedeCrear = computed(() => this.auth.permisos().has(PERMISOS.COMPRA_CREAR));
  private readonly listarPaginado = inject(ListarComprasPaginadoUseCase);
  private readonly consultarDetalle = inject(ConsultarDetalleCompraUseCase);
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('detalleDialog');

  readonly compras = signal<CompraItem[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtroProveedor = signal('');
  readonly filtroFechaDesde = signal('');
  readonly filtroFechaHasta = signal('');

  readonly compraSeleccionada = signal<CompraItem | null>(null);
  readonly detalles = signal<CompraDetalle[]>([]);
  readonly cargandoDetalle = signal(false);
  readonly errorDetalle = signal<string | null>(null);

  readonly hoy: string = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  readonly maxFechaDesde = computed(() => this.filtroFechaHasta() || this.hoy);

  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.cargar();
  }

  aplicarFiltros(): void {
    this.page.set(0);
    this.cargar();
  }

  cambiarFechaDesde(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.filtroFechaDesde.set(val);
    // dispara si ambas están llenas (filtro completo) o si se borró una (quitar filtro)
    if ((val && this.filtroFechaHasta()) || !val) {
      this.page.set(0);
      this.cargar();
    }
  }

  cambiarFechaHasta(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.filtroFechaHasta.set(val);
    if ((val && this.filtroFechaDesde()) || !val) {
      this.page.set(0);
      this.cargar();
    }
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    const proveedor = this.filtroProveedor().trim() || undefined;
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();
    const ambasFechas = desde && hasta;

    try {
      const res = await this.listarPaginado.execute({
        page: this.page(),
        size: this.size(),
        ...(proveedor ? { proveedor } : {}),
        ...(ambasFechas ? { fechaDesde: desde, fechaHasta: hasta } : {}),
      });
      this.compras.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Error al cargar las compras. Verifique la conexión con el servidor.');
    } finally {
      this.cargando.set(false);
    }
  }

  async abrirDetalle(compra: CompraItem): Promise<void> {
    this.compraSeleccionada.set(compra);
    this.detalles.set([]);
    this.cargandoDetalle.set(true);
    this.errorDetalle.set(null);
    this.dialogEl().nativeElement.showModal();

    try {
      const detalle = await this.consultarDetalle.execute(compra.id);
      this.detalles.set(detalle);
    } catch {
      this.errorDetalle.set('Error al cargar el detalle de la compra.');
    } finally {
      this.cargandoDetalle.set(false);
    }
  }

  alCerrarDialog(): void {
    this.compraSeleccionada.set(null);
    this.detalles.set([]);
    this.errorDetalle.set(null);
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

  limpiarFiltros(): void {
    this.filtroProveedor.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.page.set(0);
    this.cargar();
  }

  crearNuevaCompra(): void {
    this.router.navigate(['/inventario/nueva-compra']);
  }
}
