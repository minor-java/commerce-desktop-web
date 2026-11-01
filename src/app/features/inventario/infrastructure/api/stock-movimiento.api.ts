import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StockMovimientoRepository } from '../../application/ports/stock-movimiento.repository';
import { environment } from '../../../../../environments/environment';
import {
  StockMovimientoPaginadoRequest,
  StockMovimientoPaginadoResponse,
  StockResumenItem,
} from '../../domain/stock-movimiento.model';
import { StockResumenDto } from '../dto/stock-movimiento.dto';
import { mapStockResumen } from '../mappers/stock-movimiento.mapper';

@Injectable({ providedIn: 'root' })
export class StockMovimientoApi implements StockMovimientoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/movimientos/stock`;

  listarPaginado(request: StockMovimientoPaginadoRequest): Promise<StockMovimientoPaginadoResponse> {
    return firstValueFrom(
      this.http.post<StockMovimientoPaginadoResponse>(`${this.baseUrl}/paginado`, request)
    );
  }

  obtenerResumen(areaNegocioId?: number): Promise<StockResumenItem> {
    const params = areaNegocioId != null ? new HttpParams().set('areaNegocioId', areaNegocioId) : undefined;
    return firstValueFrom(
      this.http.get<StockResumenDto>(`${this.baseUrl}/resumen`, { params })
    ).then(mapStockResumen);
  }
}
