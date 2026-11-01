import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LogRepository } from '../../application/ports/log.repository';
import { DiaLog } from '../../domain/log.model';

@Injectable()
export class LogApi implements LogRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/configuracion/logs`;

  listar(): Promise<DiaLog[]> {
    return firstValueFrom(this.http.get<DiaLog[]>(this.baseUrl));
  }

  descargarDia(fecha: string): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/${encodeURIComponent(fecha)}/descargar`, { responseType: 'blob' })
    );
  }

  descargarTodos(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.baseUrl}/descargar`, { responseType: 'blob' }));
  }
}
