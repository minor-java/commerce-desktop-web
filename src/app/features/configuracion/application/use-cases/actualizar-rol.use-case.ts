import { inject, Injectable } from '@angular/core';
import { ROL_REPOSITORY } from '../ports/rol.repository.token';
import { GuardarRol, Rol } from '../../domain/rol.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ActualizarRolUseCase {
  private readonly repo = inject(ROL_REPOSITORY);

  execute(id: number, request: GuardarRol): Promise<Rol> {
    return this.repo.actualizar(id, request);
  }
}
