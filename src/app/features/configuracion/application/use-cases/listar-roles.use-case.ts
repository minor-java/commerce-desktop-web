import { inject, Injectable } from '@angular/core';
import { ROL_REPOSITORY } from '../ports/rol.repository.token';
import { Rol } from '../../domain/rol.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ListarRolesUseCase {
  private readonly repo = inject(ROL_REPOSITORY);

  execute(): Promise<Rol[]> {
    return this.repo.listar();
  }
}
