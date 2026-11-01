import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../../core/auth/auth.service';
import { GetTotalVendidoMesUseCase } from '../../../application/use-cases/get-total-vendido-mes.use-case';
import { GetCantidadVentasMesUseCase } from '../../../application/use-cases/get-cantidad-ventas-mes.use-case';
import { GetTotalVendidoHoyUseCase } from '../../../application/use-cases/get-total-vendido-hoy.use-case';
import { GetTopProductosMesUseCase } from '../../../application/use-cases/get-top-productos-mes.use-case';
import { GetUltimasVentasUseCase } from '../../../application/use-cases/get-ultimas-ventas.use-case';
import { GetEstadoCajaUseCase } from '../../../application/use-cases/get-estado-caja.use-case';
import { GetTotalReversosHoyUseCase } from '../../../application/use-cases/get-total-reversos-hoy.use-case';
import { GetResumenPorAreaUseCase } from '../../../application/use-cases/get-resumen-por-area.use-case';
import { ResumenArea, TopProducto, UltimaVenta } from '../../../domain/dashboard.model';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { TopProductosComponent } from '../../components/top-productos/top-productos.component';
import { UltimasVentasComponent } from '../../components/ultimas-ventas/ultimas-ventas.component';
import { VentasPorAreaComponent } from '../../components/ventas-por-area/ventas-por-area.component';

@Component({
  selector: 'app-home',
  imports: [KpiCardComponent, TopProductosComponent, UltimasVentasComponent, VentasPorAreaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly getTotalVendidoMes = inject(GetTotalVendidoMesUseCase);
  private readonly getCantidadVentasMes = inject(GetCantidadVentasMesUseCase);
  private readonly getTotalVendidoHoy = inject(GetTotalVendidoHoyUseCase);
  private readonly getTopProductos = inject(GetTopProductosMesUseCase);
  private readonly getUltimasVentas = inject(GetUltimasVentasUseCase);
  private readonly getEstadoCaja = inject(GetEstadoCajaUseCase);
  private readonly getTotalReversosHoyUseCase = inject(GetTotalReversosHoyUseCase);
  private readonly getResumenPorArea = inject(GetResumenPorAreaUseCase);

  readonly totalVendidoMes = signal<number | null>(null);
  readonly totalVendidoMesCargando = signal(true);
  readonly totalVendidoMesError = signal<string | null>(null);

  readonly cantidadVentasMes = signal<number | null>(null);
  readonly cantidadVentasMesCargando = signal(true);
  readonly cantidadVentasMesError = signal<string | null>(null);

  readonly totalVendidoHoy = signal<number | null>(null);
  readonly totalVendidoHoyCargando = signal(true);
  readonly totalVendidoHoyError = signal<string | null>(null);

  readonly topProductos = signal<TopProducto[]>([]);
  readonly topCargando = signal(true);
  readonly topError = signal<string | null>(null);

  readonly ultimasVentas = signal<UltimaVenta[]>([]);
  readonly ventasCargando = signal(true);
  readonly ventasError = signal<string | null>(null);

  readonly cajaActiva = signal<boolean | null>(null);

  readonly totalReversosHoy = signal<number | null>(null);
  readonly totalReversosHoyCargando = signal(true);
  readonly totalReversosHoyError = signal<string | null>(null);

  readonly resumenAreas = signal<ResumenArea[]>([]);
  readonly resumenAreasCargando = signal(true);
  readonly resumenAreasError = signal<string | null>(null);

  readonly fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    void this.cargarTotalVendidoMes();
    void this.cargarCantidadVentasMes();
    void this.cargarTotalVendidoHoy();
    void this.cargarTopProductos();
    void this.cargarUltimasVentas();
    void this.cargarEstadoCaja();
    void this.cargarTotalReversosHoy();
    void this.cargarResumenPorArea();
  }

  private async cargarTotalVendidoMes(): Promise<void> {
    this.totalVendidoMesCargando.set(true);
    this.totalVendidoMesError.set(null);
    try {
      this.totalVendidoMes.set(await this.getTotalVendidoMes.execute());
    } catch {
      this.totalVendidoMesError.set('Error al cargar total vendido del mes');
    } finally {
      this.totalVendidoMesCargando.set(false);
    }
  }

  private async cargarCantidadVentasMes(): Promise<void> {
    this.cantidadVentasMesCargando.set(true);
    this.cantidadVentasMesError.set(null);
    try {
      this.cantidadVentasMes.set(await this.getCantidadVentasMes.execute());
    } catch {
      this.cantidadVentasMesError.set('Error al cargar cantidad de ventas del mes');
    } finally {
      this.cantidadVentasMesCargando.set(false);
    }
  }

  private async cargarTotalVendidoHoy(): Promise<void> {
    this.totalVendidoHoyCargando.set(true);
    this.totalVendidoHoyError.set(null);
    try {
      this.totalVendidoHoy.set(await this.getTotalVendidoHoy.execute());
    } catch {
      this.totalVendidoHoyError.set('Error al cargar total vendido hoy');
    } finally {
      this.totalVendidoHoyCargando.set(false);
    }
  }

  private async cargarTopProductos(): Promise<void> {
    this.topCargando.set(true);
    this.topError.set(null);
    try {
      this.topProductos.set(await this.getTopProductos.execute());
    } catch {
      this.topError.set('Error al cargar top productos');
    } finally {
      this.topCargando.set(false);
    }
  }

  private async cargarUltimasVentas(): Promise<void> {
    this.ventasCargando.set(true);
    this.ventasError.set(null);
    try {
      this.ultimasVentas.set(await this.getUltimasVentas.execute());
    } catch {
      this.ventasError.set('Error al cargar ventas');
    } finally {
      this.ventasCargando.set(false);
    }
  }

  private async cargarEstadoCaja(): Promise<void> {
    const usuarioId = this.auth.session()?.usuarioId;
    if (usuarioId == null) return;
    try {
      this.cajaActiva.set(await this.getEstadoCaja.execute(usuarioId));
    } catch {
      // estado de caja no crítico para el dashboard
    }
  }

  private async cargarTotalReversosHoy(): Promise<void> {
    this.totalReversosHoyCargando.set(true);
    this.totalReversosHoyError.set(null);
    try {
      this.totalReversosHoy.set(await this.getTotalReversosHoyUseCase.execute());
    } catch {
      this.totalReversosHoyError.set('Error al cargar total reversos de hoy');
    } finally {
      this.totalReversosHoyCargando.set(false);
    }
  }

  private async cargarResumenPorArea(): Promise<void> {
    this.resumenAreasCargando.set(true);
    this.resumenAreasError.set(null);
    try {
      this.resumenAreas.set(await this.getResumenPorArea.execute());
    } catch {
      this.resumenAreasError.set('Error al cargar el detalle por área');
    } finally {
      this.resumenAreasCargando.set(false);
    }
  }
}
