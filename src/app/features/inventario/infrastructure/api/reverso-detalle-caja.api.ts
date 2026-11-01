import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReversoDetalleCajaRepository } from '../../application/ports/reverso-detalle-caja.repository';
import { environment } from '../../../../../environments/environment';
import { ReversoDetalleCaja } from '../../domain/detalle-caja.model';

@Injectable()
export class ReversoDetalleCajaApi implements ReversoDetalleCajaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reversos`;

  obtenerDetalle(reversoId: number): Promise<ReversoDetalleCaja> {
    return firstValueFrom(
      this.http.get<ReversoDetalleCaja>(`${this.baseUrl}/${reversoId}`)
    );
  }
}
