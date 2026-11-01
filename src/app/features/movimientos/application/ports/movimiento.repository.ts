import { MovimientoPaginadoRequest, MovimientoPaginadoResponse } from '../../domain/movimiento-paginado.model';
import { AplicarReversoRequest, AplicarReversoResponse } from '../../domain/reverso.model';

export interface MovimientoRepository {
  listarPaginado(request: MovimientoPaginadoRequest): Promise<MovimientoPaginadoResponse>;
  aplicarReverso(request: AplicarReversoRequest): Promise<AplicarReversoResponse>;
}
