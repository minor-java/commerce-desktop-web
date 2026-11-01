import { inject, Injectable } from '@angular/core';
import { USUARIO_REPOSITORY } from '../ports/usuario.repository.token';
import { Usuario } from '../../domain/usuario.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class RestablecerContrasenaUseCase {
  private readonly repo = inject(USUARIO_REPOSITORY);

  execute(id: number, contrasena: string): Promise<Usuario> {
    return this.repo.restablecerContrasena(id, contrasena);
  }
}
