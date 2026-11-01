import { inject, Injectable } from '@angular/core';
import { AREA_NEGOCIO_CONFIG_REPOSITORY } from '../ports/area-negocio-config.repository.token';
import { AreaNegocioConfig, GuardarAreaNegocio } from '../../domain/area-negocio.model';

/** Crea (id null) o actualiza un área de negocio. Se provee en configuracion.routes. */
@Injectable()
export class GuardarAreaNegocioUseCase {
  private readonly repo = inject(AREA_NEGOCIO_CONFIG_REPOSITORY);

  execute(id: number | null, request: GuardarAreaNegocio): Promise<AreaNegocioConfig> {
    return id === null ? this.repo.crear(request) : this.repo.actualizar(id, request);
  }
}
