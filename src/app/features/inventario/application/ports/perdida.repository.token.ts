import { InjectionToken } from '@angular/core';
import { PerdidaRepository } from './perdida.repository';

export const PERDIDA_REPOSITORY = new InjectionToken<PerdidaRepository>('PERDIDA_REPOSITORY');
