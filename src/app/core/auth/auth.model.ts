import { Permiso } from './permisos';

export interface AuthRequest {
  usuario: string;
  contrasena: string;
}

export interface AuthSession {
  usuarioId: number;
  usuario: string;
  nombre: string | null;
  /** Nombre del rol ('SUPER USUARIO' para el super usuario). */
  rol: string;
  superUsuario: boolean;
  /** Mientras sea true el token no trae permisos: solo permite cambiar la contraseña. */
  debeCambiarContrasena: boolean;
  permisos: Permiso[];
  activo: boolean;
  token: string;
}

export interface CambiarContrasenaRequest {
  actual: string;
  nueva: string;
}
