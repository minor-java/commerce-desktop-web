import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ImpresionRepository } from '../../application/ports/impresion.repository';
import {
  ConfiguracionImpresion,
  ImpresoraDisponible,
  LineaTicket,
  ResultadoConexion,
  TipoPrueba,
} from '../../domain/impresion.model';

@Injectable()
export class ImpresionApi implements ImpresionRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/configuracion/impresion`;

  obtener(): Promise<ConfiguracionImpresion> {
    return firstValueFrom(this.http.get<ConfiguracionImpresion>(this.baseUrl));
  }

  guardar(config: ConfiguracionImpresion): Promise<ConfiguracionImpresion> {
    return firstValueFrom(this.http.put<ConfiguracionImpresion>(this.baseUrl, config));
  }

  vistaPrevia(config: ConfiguracionImpresion): Promise<LineaTicket[]> {
    return firstValueFrom(this.http.post<LineaTicket[]>(`${this.baseUrl}/vista-previa`, config));
  }

  listarImpresoras(): Promise<ImpresoraDisponible[]> {
    return firstValueFrom(this.http.get<ImpresoraDisponible[]>(`${this.baseUrl}/impresoras`));
  }

  probarConexion(config: ConfiguracionImpresion): Promise<ResultadoConexion> {
    return firstValueFrom(this.http.post<ResultadoConexion>(`${this.baseUrl}/probar-conexion`, config));
  }

  async imprimirPrueba(config: ConfiguracionImpresion, tipo: TipoPrueba): Promise<void> {
    const ruta = tipo === 'recibo' ? 'prueba-recibo' : 'prueba';
    await firstValueFrom(this.http.post(`${this.baseUrl}/${ruta}`, config));
  }
}
