import { inject, Injectable } from '@angular/core';
import { USUARIO_REPOSITORY } from '../ports/usuario.repository.token';
import { ActualizarUsuario, Usuario } from '../../domain/usuario.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ActualizarUsuarioUseCase {
  private readonly repo = inject(USUARIO_REPOSITORY);

  execute(id: number, request: ActualizarUsuario): Promise<Usuario> {
    return this.repo.actualizar(id, request);
  }
}
