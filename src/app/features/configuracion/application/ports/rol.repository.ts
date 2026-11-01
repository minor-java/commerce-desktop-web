import { GuardarRol, PermisoCatalogo, Rol } from '../../domain/rol.model';

export interface RolRepository {
  listar(): Promise<Rol[]>;
  listarPermisos(): Promise<PermisoCatalogo[]>;
  crear(request: GuardarRol): Promise<Rol>;
  actualizar(id: number, request: GuardarRol): Promise<Rol>;
  eliminar(id: number): Promise<void>;
}
