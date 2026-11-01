import { VentaDetalleCaja } from '../../domain/detalle-caja.model';

export interface VentaDetalleCajaRepository {
  obtenerDetalle(ventaId: number): Promise<VentaDetalleCaja>;
}
