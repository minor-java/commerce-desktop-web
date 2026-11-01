import { inject, Injectable } from '@angular/core';
import { AREA_NEGOCIO_REPOSITORY } from '../../ports/area-negocio.repository.token';
import { AreaNegocio } from '../../../domain/area-negocio.model';

@Injectable({ providedIn: 'root' })
export class ListarAreasNegocioUseCase {
  private readonly repo = inject(AREA_NEGOCIO_REPOSITORY);

  execute(): Promise<AreaNegocio[]> {
    return this.repo.listarActivos();
  }
}
