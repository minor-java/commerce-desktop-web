import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HistorialCajaRepository } from '../../application/ports/historial-caja.repository';
import { environment } from '../../../../../environments/environment';
import { HistorialCajaPaginadoRequest, HistorialCajaPaginadoResponse } from '../../domain/historial-caja.model';

@Injectable()
export class HistorialCajaApi implements HistorialCajaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/caja`;

  listarPaginado(request: HistorialCajaPaginadoRequest): Promise<HistorialCajaPaginadoResponse> {
    return firstValueFrom(
      this.http.post<HistorialCajaPaginadoResponse>(`${this.baseUrl}/paginado`, request)
    );
  }
}
