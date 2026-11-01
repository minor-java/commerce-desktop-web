import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AreaNegocioConfigRepository } from '../../application/ports/area-negocio-config.repository';
import { AreaNegocioConfig, GuardarAreaNegocio } from '../../domain/area-negocio.model';

@Injectable()
export class AreaNegocioConfigApi implements AreaNegocioConfigRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/configuracion/areas-negocio`;

  listar(): Promise<AreaNegocioConfig[]> {
    return firstValueFrom(this.http.get<AreaNegocioConfig[]>(this.baseUrl));
  }

  crear(request: GuardarAreaNegocio): Promise<AreaNegocioConfig> {
    return firstValueFrom(this.http.post<AreaNegocioConfig>(this.baseUrl, request));
  }

  actualizar(id: number, request: GuardarAreaNegocio): Promise<AreaNegocioConfig> {
    return firstValueFrom(this.http.put<AreaNegocioConfig>(`${this.baseUrl}/${id}`, request));
  }

  async eliminar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
  }
}
