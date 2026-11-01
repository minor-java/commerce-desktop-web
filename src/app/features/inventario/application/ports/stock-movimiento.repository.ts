import {
  StockMovimientoPaginadoRequest,
  StockMovimientoPaginadoResponse,
  StockResumenItem,
} from '../../domain/stock-movimiento.model';

export interface StockMovimientoRepository {
  listarPaginado(request: StockMovimientoPaginadoRequest): Promise<StockMovimientoPaginadoResponse>;
  obtenerResumen(areaNegocioId?: number): Promise<StockResumenItem>;
}
