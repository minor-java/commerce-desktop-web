import { Caja } from '../../domain/caja.model';
import { AbrirCajaRequest } from '../../domain/abrir-caja.model';
import { CerrarCajaRequest } from '../../domain/cerrar-caja.model';
import { CajaPaginadaRequest, CajaPaginadaResponse } from '../../domain/caja-paginado.model';

export interface CajaRepository {
  consultar(): Promise<Caja | null>;
  abrir(request: AbrirCajaRequest): Promise<void>;
  cerrar(request: CerrarCajaRequest): Promise<Caja>;
  listarPaginado(request: CajaPaginadaRequest): Promise<CajaPaginadaResponse>;
}
