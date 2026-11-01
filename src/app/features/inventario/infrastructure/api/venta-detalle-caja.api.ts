import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { VentaDetalleCajaRepository } from '../../application/ports/venta-detalle-caja.repository';
import { environment } from '../../../../../environments/environment';
import { VentaDetalleCaja } from '../../domain/detalle-caja.model';

@Injectable()
export class VentaDetalleCajaApi implements VentaDetalleCajaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/venta`;

  obtenerDetalle(ventaId: number): Promise<VentaDetalleCaja> {
    return firstValueFrom(
      this.http.get<VentaDetalleCaja>(`${this.baseUrl}/${ventaId}/detalle`)
    );
  }
}
