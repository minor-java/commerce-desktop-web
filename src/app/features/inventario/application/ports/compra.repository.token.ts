import { InjectionToken } from '@angular/core';
import { CompraRepository } from './compra.repository';

export const COMPRA_REPOSITORY = new InjectionToken<CompraRepository>('COMPRA_REPOSITORY');
