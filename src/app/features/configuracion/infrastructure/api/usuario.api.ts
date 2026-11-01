import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UsuarioRepository } from '../../application/ports/usuario.repository';
import { ActualizarUsuario, CrearUsuario, Usuario } from '../../domain/usuario.model';

@Injectable()
export class UsuarioApi implements UsuarioRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/configuracion/usuarios`;

  listar(): Promise<Usuario[]> {
    return firstValueFrom(this.http.get<Usuario[]>(this.baseUrl));
  }

  crear(request: CrearUsuario): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(this.baseUrl, request));
  }

  actualizar(id: number, request: ActualizarUsuario): Promise<Usuario> {
    return firstValueFrom(this.http.put<Usuario>(`${this.baseUrl}/${id}`, request));
  }

  restablecerContrasena(id: number, contrasena: string): Promise<Usuario> {
    return firstValueFrom(
      this.http.post<Usuario>(`${this.baseUrl}/${id}/restablecer-contrasena`, { contrasena })
    );
  }

  desbloquear(id: number): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(`${this.baseUrl}/${id}/desbloquear`, {}));
  }
}
