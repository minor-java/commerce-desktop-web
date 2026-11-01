import { inject, Injectable } from '@angular/core';
import { AREA_NEGOCIO_CONFIG_REPOSITORY } from '../ports/area-negocio-config.repository.token';
import { AreaNegocioConfig } from '../../domain/area-negocio.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ListarAreasNegocioConfigUseCase {
  private readonly repo = inject(AREA_NEGOCIO_CONFIG_REPOSITORY);

  execute(): Promise<AreaNegocioConfig[]> {
    return this.repo.listar();
  }
}
