import { inject, Injectable } from '@angular/core';
import { RESPALDO_REPOSITORY } from '../ports/respaldo.repository.token';
import { RestaurarRespaldo } from '../../domain/respaldo.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class RestaurarRespaldoUseCase {
  private readonly repo = inject(RESPALDO_REPOSITORY);

  execute(request: RestaurarRespaldo): Promise<void> {
    return this.repo.restaurar(request);
  }
}
