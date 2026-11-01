import { inject, Injectable } from '@angular/core';
import { ROL_REPOSITORY } from '../ports/rol.repository.token';
import { GuardarRol, Rol } from '../../domain/rol.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class CrearRolUseCase {
  private readonly repo = inject(ROL_REPOSITORY);

  execute(request: GuardarRol): Promise<Rol> {
    return this.repo.crear(request);
  }
}
