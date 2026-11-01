import { ResumenArea, TopProducto, UltimaVenta } from '../../domain/dashboard.model';

export interface DashboardRepository {
  getTotalVendidoMes(areaNegocioId?: number): Promise<number>;
  getCantidadVentasMes(areaNegocioId?: number): Promise<number>;
  getTotalVendidoHoy(areaNegocioId?: number): Promise<number>;
  getUltimasVentas(): Promise<UltimaVenta[]>;
  getTopProductosMes(): Promise<TopProducto[]>;
  tieneCajaActiva(usuarioId: number): Promise<boolean>;
  getTotalReversosHoy(areaNegocioId?: number): Promise<number>;
  getResumenPorArea(): Promise<ResumenArea[]>;
}
