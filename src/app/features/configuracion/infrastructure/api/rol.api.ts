import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RolRepository } from '../../application/ports/rol.repository';
import { GuardarRol, PermisoCatalogo, Rol } from '../../domain/rol.model';

@Injectable()
export class RolApi implements RolRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/configuracion`;

  listar(): Promise<Rol[]> {
    return firstValueFrom(this.http.get<Rol[]>(`${this.baseUrl}/roles`));
  }

  listarPermisos(): Promise<PermisoCatalogo[]> {
    return firstValueFrom(this.http.get<PermisoCatalogo[]>(`${this.baseUrl}/permisos`));
  }

  crear(request: GuardarRol): Promise<Rol> {
    return firstValueFrom(this.http.post<Rol>(`${this.baseUrl}/roles`, request));
  }

  actualizar(id: number, request: GuardarRol): Promise<Rol> {
    return firstValueFrom(this.http.put<Rol>(`${this.baseUrl}/roles/${id}`, request));
  }

  async eliminar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/roles/${id}`));
  }
}
