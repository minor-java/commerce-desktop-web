import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ListarMovimientosPaginadoUseCase } from '../../../application/use-cases/listar-movimientos-paginado.use-case';
import { AplicarReversoUseCase } from '../../../application/use-cases/aplicar-reverso.use-case';
import { MovimientoItem, TipoMovimiento } from '../../../domain/movimiento-paginado.model';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

interface TabState {
  items: MovimientoItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
  cargando: boolean;
  error: string | null;
  fechaDesde: string;
  fechaHasta: string;
  fechaError: string | null;
  reversandoId: number | null;
  comboConfirmando: MovimientoItem | null;
}

const crearTabState = (): TabState => ({
  items: [],
  totalRows: 0,
  page: 0,
  size: 10,
  totalPages: 0,
  cargando: false,
  error: null,
  fechaDesde: '',
  fechaHasta: '',
  fechaError: null,
  reversandoId: null,
  comboConfirmando: null,
});

const TAB_REFERENCIA: Record<TipoMovimiento, string> = {
  ENTRADA: 'COMPRA_DETALLE',
  SALIDA: 'VENTA_DETALLE',
  REVERSO: 'REVERSO',
};

@Component({
  selector: 'app-movimientos',
  imports: [DatePipe, DecimalPipe, PaginationComponent],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimientosComponent implements OnInit {
  private readonly listarPaginado = inject(ListarMovimientosPaginadoUseCase);
  private readonly aplicarReversoUseCase = inject(AplicarReversoUseCase);
  private readonly toastService = inject(ToastService);

  readonly tabsList: { tipo: TipoMovimiento; label: string; puedeReversar: boolean }[] = [
    { tipo: 'ENTRADA', label: 'Entradas', puedeReversar: true },
    { tipo: 'SALIDA', label: 'Salidas', puedeReversar: true },
    { tipo: 'REVERSO', label: 'Reversos', puedeReversar: false },
  ];

  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly hoy: string = (() => {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  })();

  readonly activeTab = signal<TipoMovimiento>('ENTRADA');

  readonly estadoTabs = signal<Record<TipoMovimiento, TabState>>({
    ENTRADA: crearTabState(),
    SALIDA: crearTabState(),
    REVERSO: crearTabState(),
  });

  readonly estadoActual = computed(() => this.estadoTabs()[this.activeTab()]);
  readonly tabActual = computed(() => this.tabsList.find(t => t.tipo === this.activeTab())!);

  ngOnInit(): void {
    this.cargar('ENTRADA');
  }

  seleccionarTab(tipo: TipoMovimiento): void {
    if (tipo === this.activeTab()) return;
    this.activeTab.set(tipo);
    this.actualizarTab(tipo, { page: 0 });
    this.cargar(tipo);
  }

  onFechaDesdeChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const tab = this.activeTab();
    this.actualizarTab(tab, { fechaDesde: valor, fechaError: null });
    const hasta = this.estadoTabs()[tab].fechaHasta;
    if (valor && hasta) {
      this.validarYConsultar(tab, valor, hasta);
    }
  }

  onFechaHastaChange(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const tab = this.activeTab();
    this.actualizarTab(tab, { fechaHasta: valor, fechaError: null });
    const desde = this.estadoTabs()[tab].fechaDesde;
    if (desde && valor) {
      this.validarYConsultar(tab, desde, valor);
    }
  }

  limpiarFiltros(): void {
    const tab = this.activeTab();
    this.actualizarTab(tab, { fechaDesde: '', fechaHasta: '', fechaError: null, page: 0 });
    this.cargar(tab);
  }

  cambiarPagina(p: number): void {
    const tab = this.activeTab();
    if (p === this.estadoTabs()[tab].page) return;
    this.actualizarTab(tab, { page: p });
    this.cargar(tab);
  }

  cambiarTamano(size: number): void {
    const tab = this.activeTab();
    this.actualizarTab(tab, { size, page: 0 });
    this.cargar(tab);
  }

  aplicarReverso(item: MovimientoItem): void {
    const tab = this.activeTab();
    if (this.estadoTabs()[tab].reversandoId !== null) return;

    if (item.comboId !== null) {
      this.actualizarTab(tab, { comboConfirmando: item });
      return;
    }

    void this.ejecutarReverso(item);
  }

  confirmarReversoCombo(): void {
    const tab = this.activeTab();
    const item = this.estadoTabs()[tab].comboConfirmando;
    if (!item) return;
    this.actualizarTab(tab, { comboConfirmando: null });
    void this.ejecutarReverso(item);
  }

  cancelarReversoCombo(): void {
    const tab = this.activeTab();
    this.actualizarTab(tab, { comboConfirmando: null });
  }

  private async ejecutarReverso(item: MovimientoItem): Promise<void> {
    const tab = this.activeTab();
    this.actualizarTab(tab, { reversandoId: item.id });
    try {
      await this.aplicarReversoUseCase.execute(item.id);
      this.toastService.show('Reverso aplicado correctamente.', 'success');
      this.actualizarTab(tab, { reversandoId: null });
      await this.cargar(tab);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al aplicar el reverso.';
      this.toastService.show(mensaje, 'error');
      this.actualizarTab(tab, { reversandoId: null });
    }
  }

  private validarYConsultar(tab: TipoMovimiento, desde: string, hasta: string): void {
    if (desde > this.hoy || hasta > this.hoy) {
      this.actualizarTab(tab, { fechaError: 'Solo se permiten fechas hasta la fecha actual.' });
      return;
    }
    if (desde > hasta) {
      this.actualizarTab(tab, { fechaError: 'La fecha inicial no puede ser mayor que la fecha final.' });
      return;
    }
    this.actualizarTab(tab, { fechaError: null, page: 0 });
    this.cargar(tab);
  }

  private async cargar(tipo: TipoMovimiento): Promise<void> {
    const estado = this.estadoTabs()[tipo];
    this.actualizarTab(tipo, { cargando: true, error: null });

    try {
      const res = await this.listarPaginado.execute({
        page: estado.page,
        size: estado.size,
        referenciaTipo: TAB_REFERENCIA[tipo],
        ...(estado.fechaDesde && estado.fechaHasta
          ? { fechaDesde: estado.fechaDesde, fechaHasta: estado.fechaHasta }
          : {}),
      });
      this.actualizarTab(tipo, {
        items: res.contenido,
        totalRows: res.totalRows,
        totalPages: res.totalPages,
        cargando: false,
      });
    } catch {
      this.actualizarTab(tipo, {
        cargando: false,
        error: 'Error al cargar los movimientos. Verifique la conexión con el servidor.',
      });
    }
  }

  private actualizarTab(tipo: TipoMovimiento, parcial: Partial<TabState>): void {
    this.estadoTabs.update(estado => ({
      ...estado,
      [tipo]: { ...estado[tipo], ...parcial },
    }));
  }
}
