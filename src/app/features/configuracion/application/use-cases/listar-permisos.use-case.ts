import { inject, Injectable } from '@angular/core';
import { ROL_REPOSITORY } from '../ports/rol.repository.token';
import { PermisoCatalogo } from '../../domain/rol.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ListarPermisosUseCase {
  private readonly repo = inject(ROL_REPOSITORY);

  execute(): Promise<PermisoCatalogo[]> {
    return this.repo.listarPermisos();
  }
}
