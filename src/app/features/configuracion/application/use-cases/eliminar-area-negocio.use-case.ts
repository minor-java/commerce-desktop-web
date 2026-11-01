import { inject, Injectable } from '@angular/core';
import { AREA_NEGOCIO_CONFIG_REPOSITORY } from '../ports/area-negocio-config.repository.token';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class EliminarAreaNegocioUseCase {
  private readonly repo = inject(AREA_NEGOCIO_CONFIG_REPOSITORY);

  execute(id: number): Promise<void> {
    return this.repo.eliminar(id);
  }
}
