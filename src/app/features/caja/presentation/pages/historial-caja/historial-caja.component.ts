import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CajaPaginadaItem } from '../../../domain/caja-paginado.model';
import { ListarCajaPaginadoUseCase } from '../../../application/use-cases/listar-caja-paginado.use-case';
import { ModalService } from '../../../../../shared/components/modal/modal.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-historial-caja',
  imports: [DecimalPipe, PaginationComponent],
  templateUrl: './historial-caja.component.html',
  styleUrl: './historial-caja.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialCajaComponent implements OnInit {
  private readonly listarPaginado = inject(ListarCajaPaginadoUseCase);
  private readonly modal = inject(ModalService);

  readonly cajas = signal<CajaPaginadaItem[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtroEstado = signal<'' | 'ABIERTA' | 'CERRADA'>('');
  readonly filtroConDiferencia = signal<'' | 'true' | 'false'>('');
  readonly filtroUsuarioId = signal('');
  readonly filtroFechaAperturaDesde = signal('');
  readonly filtroFechaAperturaHasta = signal('');
  readonly filtroFechaCierreDesde = signal('');
  readonly filtroFechaCierreHasta = signal('');

  readonly errorFechaApertura = signal<string | null>(null);
  readonly errorFechaCierre = signal<string | null>(null);

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
    this.filtroConDiferencia.set('');
    this.filtroUsuarioId.set('');
    this.filtroFechaAperturaDesde.set('');
    this.filtroFechaAperturaHasta.set('');
    this.filtroFechaCierreDesde.set('');
    this.filtroFechaCierreHasta.set('');
    this.errorFechaApertura.set(null);
    this.errorFechaCierre.set(null);
    this.page.set(0);
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    const estadoRaw = this.filtroEstado();
    const estado = estadoRaw ? estadoRaw as 'ABIERTA' | 'CERRADA' : undefined;

    const conDiferenciaRaw = this.filtroConDiferencia();
    const conDiferencia = conDiferenciaRaw === 'true' ? true : conDiferenciaRaw === 'false' ? false : undefined;

    const usuarioIdRaw = this.filtroUsuarioId().trim();
    const usuarioId = usuarioIdRaw !== '' ? parseInt(usuarioIdRaw, 10) : undefined;

    const fechaAperturaDesde = this.filtroFechaAperturaDesde() || undefined;
    const fechaAperturaHasta = this.filtroFechaAperturaHasta() || undefined;
    const fechaCierreDesde = this.filtroFechaCierreDesde() || undefined;
    const fechaCierreHasta = this.filtroFechaCierreHasta() || undefined;

    try {
      const res = await this.listarPaginado.execute({
        page: this.page(),
        size: this.size(),
        ...(estado ? { estado } : {}),
        ...(conDiferencia !== undefined ? { conDiferencia } : {}),
        ...(usuarioId != null ? { usuarioId } : {}),
        ...(fechaAperturaDesde ? { fechaAperturaDesde } : {}),
        ...(fechaAperturaHasta ? { fechaAperturaHasta } : {}),
        ...(fechaCierreDesde ? { fechaCierreDesde } : {}),
        ...(fechaCierreHasta ? { fechaCierreHasta } : {}),
      });
      this.cajas.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Error al cargar el historial. Verifique la conexión con el servidor.');
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarPagina(p: number): void {
    if (p === this.page()) return;
    this.page.set(p);
    this.cargar();
  }

  cambiarFiltroEstado(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value as '' | 'ABIERTA' | 'CERRADA');
    this.aplicarFiltros();
  }

  cambiarFiltroConDiferencia(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroConDiferencia.set(select.value as '' | 'true' | 'false');
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

  cambiarTamano(size: number): void {
    this.size.set(size);
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

  actualizarFechaCierreDesde(event: Event): void {
    this.filtroFechaCierreDesde.set((event.target as HTMLInputElement).value);
    this.validarYAplicarFechaCierre();
  }

  actualizarFechaCierreHasta(event: Event): void {
    this.filtroFechaCierreHasta.set((event.target as HTMLInputElement).value);
    this.validarYAplicarFechaCierre();
  }

  private validarYAplicarFechaApertura(): void {
    const desde = this.filtroFechaAperturaDesde();
    const hasta = this.filtroFechaAperturaHasta();
    if (desde && hasta && desde > hasta) {
      this.errorFechaApertura.set('Fecha inicial mayor a la final');
      return;
    }
    this.errorFechaApertura.set(null);
    this.aplicarFiltros();
  }

  private validarYAplicarFechaCierre(): void {
    const desde = this.filtroFechaCierreDesde();
    const hasta = this.filtroFechaCierreHasta();
    if (desde && hasta && desde > hasta) {
      this.errorFechaCierre.set('Fecha inicial mayor a la final');
      return;
    }
    this.errorFechaCierre.set(null);
    this.aplicarFiltros();
  }

  abrirDetalle(item: CajaPaginadaItem): void {
    this.modal.openInfo({
      titulo: 'Detalle de Caja',
      filas: [
        { etiqueta: 'Monto inicial', valor: this.formatearMoneda(item.montoInicial) },
        { etiqueta: 'Total ingresos', valor: this.formatearMoneda(item.totalIngresos) },
        { etiqueta: 'Total egresos', valor: this.formatearMoneda(item.totalEgresos) },
        { etiqueta: 'Saldo esperado', valor: this.formatearMoneda(item.saldoEsperado) },
        { etiqueta: 'Monto cierre real', valor: this.formatearMoneda(item.montoCierreReal) },
        { etiqueta: 'Diferencia', valor: this.formatearMoneda(item.diferencia) },
        { etiqueta: 'Estado', valor: item.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada' },
        { etiqueta: 'Fecha apertura', valor: this.formatearFecha(item.fechaApertura) },
        { etiqueta: 'Fecha cierre', valor: this.formatearFecha(item.fechaCierre) },
        { etiqueta: 'Usuario', valor: item.usuario },
      ],
    });
  }

  formatearFecha(fechaIso: string | null): string {
    if (!fechaIso) return '-';
    const d = new Date(fechaIso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private formatearMoneda(valor: number | null): string {
    if (valor === null) return '-';
    const [entero, decimal] = valor.toFixed(2).split('.');
    const decimalLimpio = decimal ? decimal.replace(/0+$/, '') : '';
    return `${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalLimpio ? '.' + decimalLimpio : ''}`;
  }

  descripcionUsuario(item: CajaPaginadaItem): string {
    return `${item.usuarioId} - ${item.usuario}`;
  }
}
