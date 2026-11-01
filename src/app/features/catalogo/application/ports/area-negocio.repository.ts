import { AreaNegocio } from "../../domain/area-negocio.model";

export interface AreaNegocioRepository {
  listarActivos(): Promise<AreaNegocio[]>;
}
