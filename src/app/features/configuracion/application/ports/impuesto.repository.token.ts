import { InjectionToken } from '@angular/core';
import { ImpuestoRepository } from './impuesto.repository';

export const IMPUESTO_REPOSITORY = new InjectionToken<ImpuestoRepository>('IMPUESTO_REPOSITORY');
