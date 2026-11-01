import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RespaldoRepository } from '../../application/ports/respaldo.repository';
import { Respaldo, RestaurarRespaldo, VistaPreviaRespaldo } from '../../domain/respaldo.model';

@Injectable()
export class RespaldoApi implements RespaldoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/configuracion/respaldos`;

  listar(): Promise<Respaldo[]> {
    return firstValueFrom(this.http.get<Respaldo[]>(this.baseUrl));
  }

  generar(): Promise<Respaldo> {
    return firstValueFrom(this.http.post<Respaldo>(this.baseUrl, {}));
  }

  descargar(archivo: string): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/${encodeURIComponent(archivo)}/descargar`, { responseType: 'blob' })
    );
  }

  vistaPrevia(archivo: string): Promise<VistaPreviaRespaldo> {
    return firstValueFrom(
      this.http.get<VistaPreviaRespaldo>(`${this.baseUrl}/${encodeURIComponent(archivo)}/vista-previa`)
    );
  }

  cargar(archivo: File): Promise<VistaPreviaRespaldo> {
    const form = new FormData();
    form.append('archivo', archivo, archivo.name);
    return firstValueFrom(this.http.post<VistaPreviaRespaldo>(`${this.baseUrl}/cargar`, form));
  }

  async restaurar(request: RestaurarRespaldo): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/restaurar`, request));
  }
}
