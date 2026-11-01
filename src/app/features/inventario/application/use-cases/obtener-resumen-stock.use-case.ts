import { inject, Injectable } from '@angular/core';
import { STOCK_MOVIMIENTO_REPOSITORY } from '../ports/stock-movimiento.repository.token';
import { StockResumenItem } from '../../domain/stock-movimiento.model';

@Injectable({ providedIn: 'root' })
export class ObtenerResumenStockUseCase {
  private readonly repo = inject(STOCK_MOVIMIENTO_REPOSITORY);

  execute(areaNegocioId?: number): Promise<StockResumenItem> {
    return this.repo.obtenerResumen(areaNegocioId);
  }
}
