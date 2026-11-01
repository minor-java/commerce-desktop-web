import { ReversoDetalleCaja } from '../../domain/detalle-caja.model';

export interface ReversoDetalleCajaRepository {
  obtenerDetalle(reversoId: number): Promise<ReversoDetalleCaja>;
}
