import { AreaNegocioConfig, GuardarAreaNegocio } from '../../domain/area-negocio.model';

export interface AreaNegocioConfigRepository {
  listar(): Promise<AreaNegocioConfig[]>;
  crear(request: GuardarAreaNegocio): Promise<AreaNegocioConfig>;
  actualizar(id: number, request: GuardarAreaNegocio): Promise<AreaNegocioConfig>;
  eliminar(id: number): Promise<void>;
}
