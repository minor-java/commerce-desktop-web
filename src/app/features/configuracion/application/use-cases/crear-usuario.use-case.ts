import { inject, Injectable } from '@angular/core';
import { USUARIO_REPOSITORY } from '../ports/usuario.repository.token';
import { CrearUsuario, Usuario } from '../../domain/usuario.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class CrearUsuarioUseCase {
  private readonly repo = inject(USUARIO_REPOSITORY);

  execute(request: CrearUsuario): Promise<Usuario> {
    return this.repo.crear(request);
  }
}
