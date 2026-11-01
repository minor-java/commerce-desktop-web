import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ListarUsuariosUseCase } from '../../../application/use-cases/listar-usuarios.use-case';
import { ListarRolesUseCase } from '../../../application/use-cases/listar-roles.use-case';
import { DesbloquearUsuarioUseCase } from '../../../application/use-cases/desbloquear-usuario.use-case';
import { Usuario } from '../../../domain/usuario.model';
import { Rol } from '../../../domain/rol.model';
import { UsuarioFormDialogComponent } from '../../components/usuario-form-dialog/usuario-form-dialog.component';
import { RestablecerContrasenaDialogComponent } from '../../components/restablecer-contrasena-dialog/restablecer-contrasena-dialog.component';

type Dialogo =
  | { tipo: 'formulario'; usuario: Usuario | null }
  | { tipo: 'contrasena'; usuario: Usuario }
  | null;

@Component({
  selector: 'app-usuarios',
  imports: [DatePipe, UsuarioFormDialogComponent, RestablecerContrasenaDialogComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly listarUsuarios = inject(ListarUsuariosUseCase);
  private readonly listarRoles = inject(ListarRolesUseCase);
  private readonly desbloquearUseCase = inject(DesbloquearUsuarioUseCase);

  readonly usuarios = signal<Usuario[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogo = signal<Dialogo>(null);
  readonly procesandoId = signal<number | null>(null);

  readonly usuarioActualId = computed(() => this.auth.session()?.usuarioId ?? null);

  /** Datos del diálogo abierto, ya separados por tipo para el template. */
  readonly dialogoFormulario = computed(() => {
    const d = this.dialogo();
    return d?.tipo === 'formulario' ? d : null;
  });
  readonly dialogoContrasena = computed(() => {
    const d = this.dialogo();
    return d?.tipo === 'contrasena' ? d : null;
  });

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [usuarios, roles] = await Promise.all([this.listarUsuarios.execute(), this.listarRoles.execute()]);
      this.usuarios.set(usuarios);
      this.roles.set(roles);
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudieron cargar los usuarios'));
    } finally {
      this.cargando.set(false);
    }
  }

  nuevo(): void {
    this.dialogo.set({ tipo: 'formulario', usuario: null });
  }

  editar(usuario: Usuario): void {
    this.dialogo.set({ tipo: 'formulario', usuario });
  }

  restablecer(usuario: Usuario): void {
    this.dialogo.set({ tipo: 'contrasena', usuario });
  }

  cerrarDialogo(): void {
    this.dialogo.set(null);
  }

  onGuardado(usuario: Usuario, mensaje: string): void {
    this.reemplazar(usuario);
    this.dialogo.set(null);
    this.toast.show(mensaje, 'success');
  }

  onUsuarioGuardado(usuario: Usuario, esNuevo: boolean): void {
    this.onGuardado(usuario, esNuevo ? `Usuario ${usuario.usuario} creado` : `Usuario ${usuario.usuario} actualizado`);
  }

  async desbloquear(usuario: Usuario): Promise<void> {
    this.procesandoId.set(usuario.id);
    try {
      this.reemplazar(await this.desbloquearUseCase.execute(usuario.id));
      this.toast.show(`Usuario ${usuario.usuario} desbloqueado`, 'success');
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo desbloquear el usuario'), 'error');
    } finally {
      this.procesandoId.set(null);
    }
  }

  private reemplazar(usuario: Usuario): void {
    this.usuarios.update(lista => {
      const existe = lista.some(u => u.id === usuario.id);
      const nueva = existe ? lista.map(u => (u.id === usuario.id ? usuario : u)) : [...lista, usuario];
      return nueva.sort((a, b) => a.usuario.localeCompare(b.usuario));
    });
  }
}
