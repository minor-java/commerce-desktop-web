export interface Usuario {
  id: number;
  usuario: string;
  nombre: string | null;
  rolId: number | null;
  rolNombre: string | null;
  activo: boolean;
  bloqueado: boolean;
  intentos: number;
  debeCambiarContrasena: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  ultimoLogin: string | null;
}

export interface CrearUsuario {
  usuario: string;
  nombre: string | null;
  contrasena: string;
  rolId: number;
  activo: boolean;
}

export interface ActualizarUsuario {
  nombre: string | null;
  rolId: number;
  activo: boolean;
}
