import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovimientoCajaItem, VentaDetalleCaja, ReversoDetalleCaja } from '../../../domain/detalle-caja.model';
import { HistorialCajaItem } from '../../../domain/historial-caja.model';
import { ConsultarDetalleCajaUseCase } from '../../../application/use-cases/consultar-detalle-caja.use-case';
import { ConsultarVentaDetalleCajaUseCase } from '../../../application/use-cases/consultar-venta-detalle-caja.use-case';
import { ConsultarReversoDetalleCajaUseCase } from '../../../application/use-cases/consultar-reverso-detalle-caja.use-case';

type Vista = 'movimientos' | 'venta' | 'reverso';

@Component({
  selector: 'app-detalle-caja',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './detalle-caja.component.html',
  styleUrl: './detalle-caja.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleCajaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly consultarDetalle = inject(ConsultarDetalleCajaUseCase);
  private readonly consultarVenta = inject(ConsultarVentaDetalleCajaUseCase);
  private readonly consultarReverso = inject(ConsultarReversoDetalleCajaUseCase);

  readonly caja = signal<HistorialCajaItem | null>(
    (history.state as { caja?: HistorialCajaItem }).caja ?? null
  );
  readonly movimientos = signal<MovimientoCajaItem[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly filtroTipo = signal('');
  readonly filtroMetodoPago = signal('');
  readonly filtroMontoPendiente = signal('');
  readonly filtroMonto = signal('');
  readonly filtroReferenciaTipo = signal('');

  readonly movimientosFiltrados = computed(() => {
    let items = this.movimientos();
    const tipo = this.filtroTipo();
    const metodo = this.filtroMetodoPago();
    const monto = this.filtroMonto().trim();
    const referencia = this.filtroReferenciaTipo();

    if (tipo) items = items.filter(m => m.tipo === tipo);
    if (metodo) items = items.filter(m => m.metodoPago === metodo);
    if (monto) items = items.filter(m => String(m.monto).includes(monto));
    if (referencia) items = items.filter(m => m.referenciaTipo === referencia);

    return items;
  });

  readonly vistaActual = signal<Vista>('movimientos');
  readonly ventaDetalle = signal<VentaDetalleCaja | null>(null);
  readonly reversoDetalle = signal<ReversoDetalleCaja | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly errorDetalle = signal<string | null>(null);
  readonly movimientoCargandoId = signal<number | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  async cargar(cajaId: number): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const movimientos = await this.consultarDetalle.execute(cajaId);
      this.movimientos.set(movimientos);
    } catch {
      this.error.set('Error al cargar los movimientos. Verifique la conexión con el servidor.');
    } finally {
      this.cargando.set(false);
    }
  }

  async abrirMovimiento(item: MovimientoCajaItem): Promise<void> {
    if (item.referenciaId === null || this.movimientoCargandoId() !== null) return;

    this.movimientoCargandoId.set(item.id);
    this.cargandoDetalle.set(true);
    this.errorDetalle.set(null);

    try {
      if (item.referenciaTipo === 'VENTA') {
        const venta = await this.consultarVenta.execute(item.referenciaId);
        this.ventaDetalle.set(venta);
        this.vistaActual.set('venta');
      } else if (item.referenciaTipo === 'REVERSO') {
        const reverso = await this.consultarReverso.execute(item.referenciaId);
        this.reversoDetalle.set(reverso);
        this.vistaActual.set('reverso');
      }
    } catch {
      this.errorDetalle.set('Error al cargar el detalle. Verifique la conexión con el servidor.');
    } finally {
      this.cargandoDetalle.set(false);
      this.movimientoCargandoId.set(null);
    }
  }

  volverAMovimientos(): void {
    this.vistaActual.set('movimientos');
    this.ventaDetalle.set(null);
    this.reversoDetalle.set(null);
    this.errorDetalle.set(null);
  }

  aplicarFiltroMonto(): void {
    this.filtroMonto.set(this.filtroMontoPendiente().trim());
  }

  limpiarFiltros(): void {
    this.filtroTipo.set('');
    this.filtroMetodoPago.set('');
    this.filtroMontoPendiente.set('');
    this.filtroMonto.set('');
    this.filtroReferenciaTipo.set('');
  }

  volver(): void {
    this.router.navigate(['/inventario/historial-caja']);
  }
}
