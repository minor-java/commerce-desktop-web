import { PerdidaPaginadoRequest, PerdidaPaginadoResponse, RegistrarPerdidaRequest } from '../../domain/perdida.model';

export interface PerdidaRepository {
  registrar(request: RegistrarPerdidaRequest): Promise<void>;
  listarPaginado(request: PerdidaPaginadoRequest): Promise<PerdidaPaginadoResponse>;
}
