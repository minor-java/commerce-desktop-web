import { MovimientoCajaItem } from '../../domain/detalle-caja.model';

export interface DetalleCajaRepository {
  consultarMovimientos(cajaId: number): Promise<MovimientoCajaItem[]>;
}
