import { InjectionToken } from "@angular/core";
import { AreaNegocioRepository } from "./area-negocio.repository";

export const AREA_NEGOCIO_REPOSITORY = new InjectionToken<AreaNegocioRepository>(
  'AREA_NEGOCIO_REPOSITORY'
);
