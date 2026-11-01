import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ConsultarCajaUseCase } from '../../../application/use-cases/consultar-caja.use-case';
import { ListarHistorialVentasUseCase } from '../../../application/use-cases/listar-historial-ventas.use-case';
import { Caja } from '../../../domain/caja.model';
import { HistorialVentaItem } from '../../../domain/historial-ventas-caja.model';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { VENTA_REPOSITORY } from '../../../application/ports/venta.repository.token';
import { PrintService } from '../../../../../shared/services/print.service';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-historial-ventas-caja',
  imports: [RouterLink, DecimalPipe, PaginationComponent],
  templateUrl: './historial-ventas-caja.component.html',
  styleUrl: './historial-ventas-caja.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialVentasCajaComponent implements OnInit {
  private readonly consultarCaja = inject(ConsultarCajaUseCase);
  private readonly listarHistorial = inject(ListarHistorialVentasUseCase);
  private readonly ventaRepo = inject(VENTA_REPOSITORY);
  private readonly printService = inject(PrintService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly verificandoCaja = signal(true);
  readonly caja = signal<Caja | null>(null);
  readonly ventas = signal<HistorialVentaItem[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtroId = signal('');
  readonly filtroTotal = signal('');
  readonly filtroFechaDesde = signal('');
  readonly filtroFechaHasta = signal('');

  readonly errorFecha = signal<string | null>(null);
  readonly imprimiendoId = signal<number | null>(null);

  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    void this.verificarCaja();
  }

  private async verificarCaja(): Promise<void> {
    this.verificandoCaja.set(true);
    try {
      const cajaActiva = await this.consultarCaja.execute();
      this.caja.set(cajaActiva);
      if (cajaActiva) {
        await this.cargar();
      }
    } catch {
      this.caja.set(null);
    } finally {
      this.verificandoCaja.set(false);
    }
  }

  async cargar(): Promise<void> {
    const cajaActiva = this.caja();
    if (!cajaActiva) return;

    this.cargando.set(true);
    this.error.set(null);

    const idRaw = this.filtroId().trim();
    const id = idRaw !== '' ? parseInt(idRaw, 10) : undefined;

    const totalRaw = this.filtroTotal().trim().replace(',', '.');
    const total = totalRaw !== '' ? parseFloat(totalRaw) : undefined;

    const filtroFechas = this.buildFiltroFechas();

    try {
      const res = await this.listarHistorial.execute({
        page: this.page(),
        size: this.size(),
        cajaId: cajaActiva.id,
        ...(id != null && !isNaN(id) ? { id } : {}),
        ...(total != null && !isNaN(total) ? { total } : {}),
        ...filtroFechas,
      });
      this.ventas.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Error al cargar el historial. Verifique la conexión con el servidor.');
    } finally {
      this.cargando.set(false);
    }
  }

  private buildFiltroFechas(): { fechaDesde?: string; fechaHasta?: string } {
    const desdeDate = this.filtroFechaDesde();
    const hastaDate = this.filtroFechaHasta();

    if (!desdeDate || !hastaDate) return {};

    return {
      fechaDesde: `${desdeDate}T00:00:00`,
      fechaHasta: `${hastaDate}T23:59:59`,
    };
  }

  limpiarFiltros(): void {
    this.filtroId.set('');
    this.filtroTotal.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.errorFecha.set(null);
    this.page.set(0);
    void this.cargar();
  }

  aplicarFiltros(): void {
    if (!this.validarFiltros()) return;
    this.page.set(0);
    void this.cargar();
  }

  private validarFiltros(): boolean {
    const desdeDate = this.filtroFechaDesde();
    const hastaDate = this.filtroFechaHasta();

    if ((desdeDate && !hastaDate) || (!desdeDate && hastaDate)) {
      this.errorFecha.set('Ingrese ambas fechas para aplicar el filtro');
      return false;
    }
    if (desdeDate && hastaDate && desdeDate > hastaDate) {
      this.errorFecha.set('La fecha inicial no puede ser mayor a la final');
      return false;
    }
    this.errorFecha.set(null);

    return true;
  }

  actualizarFiltroId(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+$/.test(value)) {
      this.filtroId.set(value);
    } else {
      input.value = this.filtroId();
    }
  }

  actualizarFiltroTotal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^[\d.,]+$/.test(value)) {
      this.filtroTotal.set(value);
    } else {
      input.value = this.filtroTotal();
    }
  }

  actualizarFechaDesde(event: Event): void {
    this.filtroFechaDesde.set((event.target as HTMLInputElement).value);
    this.onFechaOHoraCambia();
  }

  actualizarFechaHasta(event: Event): void {
    this.filtroFechaHasta.set((event.target as HTMLInputElement).value);
    this.onFechaOHoraCambia();
  }

  private onFechaOHoraCambia(): void {
    if (this.validarFiltros()) {
      this.page.set(0);
      void this.cargar();
    }
  }

  cambiarPagina(p: number): void {
    if (p === this.page()) return;
    this.page.set(p);
    void this.cargar();
  }

  cambiarTamano(size: number): void {
    this.size.set(size);
    this.page.set(0);
    void this.cargar();
  }

  verDetalle(item: HistorialVentaItem): void {
    void this.router.navigate(['/caja/historial-ventas', item.id]);
  }

  async imprimirTicket(event: Event, ventaId: number): Promise<void> {
    event.stopPropagation();
    if (this.imprimiendoId() !== null) return;

    this.imprimiendoId.set(ventaId);
    try {
      const lineas = await this.ventaRepo.obtenerTicket(ventaId);
      await this.printService.imprimirTicket(lineas);
      this.toast.show('Ticket enviado a la impresora', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al imprimir el ticket';
      this.toast.show(msg, 'error');
    } finally {
      this.imprimiendoId.set(null);
    }
  }

  formatearFecha(fechaIso: string): string {
    const d = new Date(fechaIso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
}
