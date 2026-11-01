import { InjectionToken } from '@angular/core';
import { StockMovimientoRepository } from './stock-movimiento.repository';

export const STOCK_MOVIMIENTO_REPOSITORY = new InjectionToken<StockMovimientoRepository>(
  'STOCK_MOVIMIENTO_REPOSITORY'
);
