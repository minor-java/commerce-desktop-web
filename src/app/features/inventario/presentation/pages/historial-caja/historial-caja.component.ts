import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { HistorialCajaItem } from '../../../domain/historial-caja.model';
import { ListarHistorialCajaUseCase } from '../../../application/use-cases/listar-historial-caja.use-case';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-historial-caja-inventario',
  imports: [DecimalPipe, DatePipe, PaginationComponent],
  templateUrl: './historial-caja.component.html',
  styleUrl: './historial-caja.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialCajaInventarioComponent implements OnInit {
  private readonly listarPaginado = inject(ListarHistorialCajaUseCase);
  private readonly router = inject(Router);

  readonly cajas = signal<HistorialCajaItem[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtroEstado = signal<'' | 'ABIERTA' | 'CERRADA'>('');
  readonly filtroUsuarioId = signal('');
  readonly filtroFechaAperturaDesde = signal('');
  readonly filtroFechaAperturaHasta = signal('');
  readonly errorFechaApertura = signal<string | null>(null);

  readonly hoy: string = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.cargar();
  }

  aplicarFiltros(): void {
    this.page.set(0);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('');
    this.filtroUsuarioId.set('');
    this.filtroFechaAperturaDesde.set('');
    this.filtroFechaAperturaHasta.set('');
    this.errorFechaApertura.set(null);
    this.page.set(0);
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    const estadoRaw = this.filtroEstado();
    const estado = estadoRaw ? estadoRaw as 'ABIERTA' | 'CERRADA' : undefined;
    const usuarioIdRaw = this.filtroUsuarioId().trim();
    const usuarioId = usuarioIdRaw !== '' ? parseInt(usuarioIdRaw, 10) : undefined;
    const fechaAperturaDesde = this.filtroFechaAperturaDesde();
    const fechaAperturaHasta = this.filtroFechaAperturaHasta();
    const ambasFechasApertura = fechaAperturaDesde && fechaAperturaHasta;

    try {
      const res = await this.listarPaginado.execute({
        page: this.page(),
        size: this.size(),
        ...(estado ? { estado } : {}),
        ...(usuarioId != null ? { usuarioId } : {}),
        ...(ambasFechasApertura ? { fechaAperturaDesde, fechaAperturaHasta } : {}),
      });
      this.cajas.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Error al cargar el historial de caja. Verifique la conexión con el servidor.');
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

  cambiarFiltroEstado(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value as '' | 'ABIERTA' | 'CERRADA');
    this.aplicarFiltros();
  }

  actualizarFiltroUsuarioId(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+$/.test(value)) {
      this.filtroUsuarioId.set(value);
    } else {
      input.value = this.filtroUsuarioId();
    }
  }

  aplicarFiltroUsuarioId(): void {
    this.page.set(0);
    this.cargar();
  }

  actualizarFechaAperturaDesde(event: Event): void {
    this.filtroFechaAperturaDesde.set((event.target as HTMLInputElement).value);
    this.validarYAplicarFechaApertura();
  }

  actualizarFechaAperturaHasta(event: Event): void {
    this.filtroFechaAperturaHasta.set((event.target as HTMLInputElement).value);
    this.validarYAplicarFechaApertura();
  }

  abrirDetalle(item: HistorialCajaItem): void {
    this.router.navigate(['/inventario/historial-caja', item.id], {
      state: { caja: item },
    });
  }

  private validarYAplicarFechaApertura(): void {
    const desde = this.filtroFechaAperturaDesde();
    const hasta = this.filtroFechaAperturaHasta();

    if (!desde || !hasta) {
      this.errorFechaApertura.set(null);
      this.aplicarFiltros();
      return;
    }

    if (desde > hasta) {
      this.errorFechaApertura.set('La fecha inicial no puede ser mayor a la final');
      return;
    }

    this.errorFechaApertura.set(null);
    this.aplicarFiltros();
  }
}
