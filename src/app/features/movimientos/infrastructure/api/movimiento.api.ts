import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MovimientoRepository } from '../../application/ports/movimiento.repository';
import { environment } from '../../../../../environments/environment';
import { MovimientoPaginadoRequest, MovimientoPaginadoResponse } from '../../domain/movimiento-paginado.model';
import { AplicarReversoRequest, AplicarReversoResponse } from '../../domain/reverso.model';

@Injectable({ providedIn: 'root' })
export class MovimientoApi implements MovimientoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/movimientos`;
  private readonly reversosUrl = `${environment.apiUrl}/reversos`;

  listarPaginado(request: MovimientoPaginadoRequest): Promise<MovimientoPaginadoResponse> {
    return firstValueFrom(
      this.http.post<MovimientoPaginadoResponse>(this.baseUrl, request)
    );
  }

  async aplicarReverso(request: AplicarReversoRequest): Promise<AplicarReversoResponse> {
    try {
      return await firstValueFrom(
        this.http.post<AplicarReversoResponse>(this.reversosUrl, request)
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error?.mensaje) {
        throw new Error(error.error.mensaje as string);
      }
      throw error;
    }
  }
}
