import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DetalleCajaRepository } from '../../application/ports/detalle-caja.repository';
import { environment } from '../../../../../environments/environment';
import { MovimientoCajaItem } from '../../domain/detalle-caja.model';

@Injectable()
export class DetalleCajaApi implements DetalleCajaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/caja`;

  consultarMovimientos(cajaId: number): Promise<MovimientoCajaItem[]> {
    return firstValueFrom(
      this.http.get<MovimientoCajaItem[]>(`${this.baseUrl}/${cajaId}/movimientos`)
    );
  }
}
