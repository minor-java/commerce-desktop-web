import { inject, Injectable } from '@angular/core';
import { LOG_REPOSITORY } from '../ports/log.repository.token';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class DescargarLogDiaUseCase {
  private readonly repo = inject(LOG_REPOSITORY);

  execute(fecha: string): Promise<Blob> {
    return this.repo.descargarDia(fecha);
  }
}
