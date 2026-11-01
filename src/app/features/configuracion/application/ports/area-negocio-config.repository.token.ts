import { InjectionToken } from '@angular/core';
import { AreaNegocioConfigRepository } from './area-negocio-config.repository';

export const AREA_NEGOCIO_CONFIG_REPOSITORY = new InjectionToken<AreaNegocioConfigRepository>(
  'AREA_NEGOCIO_CONFIG_REPOSITORY'
);
