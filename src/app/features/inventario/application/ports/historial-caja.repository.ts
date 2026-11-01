import { HistorialCajaPaginadoRequest, HistorialCajaPaginadoResponse } from '../../domain/historial-caja.model';

export interface HistorialCajaRepository {
  listarPaginado(request: HistorialCajaPaginadoRequest): Promise<HistorialCajaPaginadoResponse>;
}
