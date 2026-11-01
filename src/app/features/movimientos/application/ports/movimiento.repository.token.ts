import { InjectionToken } from '@angular/core';
import { MovimientoRepository } from './movimiento.repository';

export const MOVIMIENTO_REPOSITORY = new InjectionToken<MovimientoRepository>('MOVIMIENTO_REPOSITORY');
