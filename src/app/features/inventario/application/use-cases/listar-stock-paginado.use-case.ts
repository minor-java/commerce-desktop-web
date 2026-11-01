import { inject, Injectable } from '@angular/core';
import { STOCK_MOVIMIENTO_REPOSITORY } from '../ports/stock-movimiento.repository.token';
import {
  StockMovimientoPaginadoRequest,
  StockMovimientoPaginadoResponse,
} from '../../domain/stock-movimiento.model';

@Injectable({ providedIn: 'root' })
export class ListarStockPaginadoUseCase {
  private readonly repo = inject(STOCK_MOVIMIENTO_REPOSITORY);

  execute(request: StockMovimientoPaginadoRequest): Promise<StockMovimientoPaginadoResponse> {
    return this.repo.listarPaginado(request);
  }
}
