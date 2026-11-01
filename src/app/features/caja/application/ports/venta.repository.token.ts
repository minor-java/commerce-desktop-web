import { InjectionToken } from '@angular/core';
import { VentaRepository } from './venta.repository';

export const VENTA_REPOSITORY = new InjectionToken<VentaRepository>('VENTA_REPOSITORY');
