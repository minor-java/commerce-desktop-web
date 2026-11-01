import { InjectionToken } from '@angular/core';
import { DetalleCajaRepository } from './detalle-caja.repository';

export const DETALLE_CAJA_REPOSITORY = new InjectionToken<DetalleCajaRepository>('DETALLE_CAJA_REPOSITORY');
