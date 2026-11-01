import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EstiloRepository } from '../../application/ports/estilo.repository';
import { ConfiguracionEstilo } from '../../domain/estilo.model';

@Injectable()
export class EstiloApi implements EstiloRepository {
  private readonly http = inject(HttpClient);

  obtener(): Promise<ConfiguracionEstilo> {
    return firstValueFrom(this.http.get<ConfiguracionEstilo>(`${environment.apiUrl}/estilos`));
  }

  guardar(estilo: ConfiguracionEstilo): Promise<ConfiguracionEstilo> {
    return firstValueFrom(this.http.put<ConfiguracionEstilo>(`${environment.apiUrl}/configuracion/estilos`, estilo));
  }
}
