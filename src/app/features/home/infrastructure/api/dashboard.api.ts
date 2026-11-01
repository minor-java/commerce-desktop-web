import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DashboardRepository } from '../../application/ports/dashboard.repository';
import { ResumenArea, TopProducto, UltimaVenta } from '../../domain/dashboard.model';
import { environment } from '../../../../../environments/environment';

function paramsDeArea(areaNegocioId?: number): HttpParams | undefined {
  return areaNegocioId != null ? new HttpParams().set('areaNegocioId', areaNegocioId) : undefined;
}

@Injectable()
export class DashboardApi implements DashboardRepository {
  private readonly http = inject(HttpClient);
  private readonly ventaUrl = `${environment.apiUrl}/venta`;
  private readonly reversoUrl = `${environment.apiUrl}/reversos`;

  getTotalVendidoMes(areaNegocioId?: number): Promise<number> {
    return firstValueFrom(
      this.http.get<number>(`${this.ventaUrl}/total-vendido-mes`, { params: paramsDeArea(areaNegocioId) })
    );
  }

  getCantidadVentasMes(areaNegocioId?: number): Promise<number> {
    return firstValueFrom(
      this.http.get<number>(`${this.ventaUrl}/cantidad-ventas-mes`, { params: paramsDeArea(areaNegocioId) })
    );
  }

  getTotalVendidoHoy(areaNegocioId?: number): Promise<number> {
    return firstValueFrom(
      this.http.get<number>(`${this.ventaUrl}/total-vendido-hoy`, { params: paramsDeArea(areaNegocioId) })
    );
  }

  getResumenPorArea(): Promise<ResumenArea[]> {
    return firstValueFrom(this.http.get<ResumenArea[]>(`${this.ventaUrl}/resumen-por-area`));
  }

  getUltimasVentas(): Promise<UltimaVenta[]> {
    return firstValueFrom(this.http.get<UltimaVenta[]>(`${this.ventaUrl}/ultimas-ventas`));
  }

  getTopProductosMes(): Promise<TopProducto[]> {
    return firstValueFrom(this.http.get<TopProducto[]>(`${this.ventaUrl}/top-productos-mes`));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tieneCajaActiva(_usuarioId: number): Promise<boolean> {
    return Promise.resolve(false);
  }

  getTotalReversosHoy(areaNegocioId?: number): Promise<number> {
    return firstValueFrom(
      this.http.get<number>(`${this.reversoUrl}/total-hoy`, { params: paramsDeArea(areaNegocioId) })
    );
  }
}
