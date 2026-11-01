import { ActualizarUsuario, CrearUsuario, Usuario } from '../../domain/usuario.model';

export interface UsuarioRepository {
  listar(): Promise<Usuario[]>;
  crear(request: CrearUsuario): Promise<Usuario>;
  actualizar(id: number, request: ActualizarUsuario): Promise<Usuario>;
  restablecerContrasena(id: number, contrasena: string): Promise<Usuario>;
  desbloquear(id: number): Promise<Usuario>;
}
