import { InjectionToken } from '@angular/core';
import { CajaRepository } from './caja.repository';

export const CAJA_REPOSITORY = new InjectionToken<CajaRepository>('CAJA_REPOSITORY');
