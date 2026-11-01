import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ParametrosVenta } from '../../../../core/negocio/negocio.model';
import { ImpuestoRepository } from '../../application/ports/impuesto.repository';
import {
  ConfiguracionImpuestos,
  GuardarConfiguracionImpuestos,
  GuardarTarifaImpuesto,
  ReporteImpuestos,
  TarifaImpuestoConfig,
} from '../../domain/impuesto.model';

@Injectable()
export class ImpuestoApi implements ImpuestoRepository {
  private readonly http = inject(HttpClient);
  private readonly configUrl = `${environment.apiUrl}/configuracion/impuestos`;

  obtenerConfiguracion(): Promise<ConfiguracionImpuestos> {
    return firstValueFrom(this.http.get<ConfiguracionImpuestos>(this.configUrl));
  }

  guardarConfiguracion(request: GuardarConfiguracionImpuestos): Promise<ConfiguracionImpuestos> {
    return firstValueFrom(this.http.put<ConfiguracionImpuestos>(this.configUrl, request));
  }

  listarTarifas(): Promise<TarifaImpuestoConfig[]> {
    return firstValueFrom(this.http.get<TarifaImpuestoConfig[]>(`${this.configUrl}/tarifas`));
  }

  crearTarifa(request: GuardarTarifaImpuesto): Promise<TarifaImpuestoConfig> {
    return firstValueFrom(this.http.post<TarifaImpuestoConfig>(`${this.configUrl}/tarifas`, request));
  }

  actualizarTarifa(id: number, request: GuardarTarifaImpuesto): Promise<TarifaImpuestoConfig> {
    return firstValueFrom(this.http.put<TarifaImpuestoConfig>(`${this.configUrl}/tarifas/${id}`, request));
  }

  async eliminarTarifa(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.configUrl}/tarifas/${id}`));
  }

  reporte(desde: string, hasta: string): Promise<ReporteImpuestos> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return firstValueFrom(this.http.get<ReporteImpuestos>(`${environment.apiUrl}/reportes/impuestos`, { params }));
  }

  obtenerParametrosVenta(): Promise<ParametrosVenta> {
    return firstValueFrom(this.http.get<ParametrosVenta>(`${environment.apiUrl}/parametros-venta`));
  }

  guardarParametrosVenta(request: ParametrosVenta): Promise<ParametrosVenta> {
    return firstValueFrom(
      this.http.put<ParametrosVenta>(`${environment.apiUrl}/configuracion/parametros-venta`, request)
    );
  }
}
