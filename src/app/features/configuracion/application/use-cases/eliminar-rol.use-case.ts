import { inject, Injectable } from '@angular/core';
import { ROL_REPOSITORY } from '../ports/rol.repository.token';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class EliminarRolUseCase {
  private readonly repo = inject(ROL_REPOSITORY);

  execute(id: number): Promise<void> {
    return this.repo.eliminar(id);
  }
}
