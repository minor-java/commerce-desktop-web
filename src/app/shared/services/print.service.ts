import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LineaTicket } from '../../features/caja/domain/venta.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/impresion`;

  async imprimirTicket(lineas: LineaTicket[]): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/imprimir`, { lineas }));
  }

  async abrirCajon(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/cajon`, {}));
  }
}
