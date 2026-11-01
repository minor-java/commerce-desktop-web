import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImpuestosVigentes, ParametrosVenta } from './negocio.model';

/**
 * Configuración del negocio que leen varias pantallas (productos, combos, áreas,
 * punto de venta). Se consulta cada vez que se abre una pantalla para reflejar
 * cambios hechos en Configuración sin reiniciar la sesión.
 */
@Injectable({ providedIn: 'root' })
export class NegocioService {
  private readonly http = inject(HttpClient);

  impuestosVigentes(): Promise<ImpuestosVigentes> {
    return firstValueFrom(this.http.get<ImpuestosVigentes>(`${environment.apiUrl}/impuestos/vigentes`));
  }

  parametrosVenta(): Promise<ParametrosVenta> {
    return firstValueFrom(this.http.get<ParametrosVenta>(`${environment.apiUrl}/parametros-venta`));
  }
}
