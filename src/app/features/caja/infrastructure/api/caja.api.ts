import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CajaRepository } from '../../application/ports/caja.repository';
import { environment } from '../../../../../environments/environment';
import { Caja } from '../../domain/caja.model';
import { AbrirCajaRequest } from '../../domain/abrir-caja.model';
import { CerrarCajaRequest } from '../../domain/cerrar-caja.model';
import { CajaDto } from '../dto/caja.dto';
import { mapCaja } from '../mappers/caja.mapper';
import { CajaPaginadaRequest, CajaPaginadaResponse } from '../../domain/caja-paginado.model';

@Injectable({ providedIn: 'root' })
export class CajaApi implements CajaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/caja`;

  async consultar(): Promise<Caja | null> {
    try {
      const dto = await firstValueFrom(
        this.http.get<CajaDto>(`${this.baseUrl}/consultar`)
      );
      if (dto.estado !== 'ABIERTA') return null;
      return mapCaja(dto);
    } catch {
      return null;
    }
  }

  async abrir(request: AbrirCajaRequest): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/abrir`, request, { observe: 'response' })
    );
  }

  async cerrar(request: CerrarCajaRequest): Promise<Caja> {
    const dto = await firstValueFrom(
      this.http.post<CajaDto>(`${this.baseUrl}/cerrar`, request)
    );
    return mapCaja(dto);
  }

  listarPaginado(request: CajaPaginadaRequest): Promise<CajaPaginadaResponse> {
    return firstValueFrom(
      this.http.post<CajaPaginadaResponse>(`${this.baseUrl}/paginado`, request)
    );
  }
}
