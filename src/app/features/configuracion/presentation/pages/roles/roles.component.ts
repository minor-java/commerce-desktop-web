import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ListarRolesUseCase } from '../../../application/use-cases/listar-roles.use-case';
import { ListarPermisosUseCase } from '../../../application/use-cases/listar-permisos.use-case';
import { EliminarRolUseCase } from '../../../application/use-cases/eliminar-rol.use-case';
import { agruparPorModulo, PermisoCatalogo, Rol } from '../../../domain/rol.model';
import { RolFormDialogComponent } from '../../components/rol-form-dialog/rol-form-dialog.component';

@Component({
  selector: 'app-roles',
  imports: [RolFormDialogComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cancelarEliminar()' },
})
export class RolesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly listarRoles = inject(ListarRolesUseCase);
  private readonly listarPermisos = inject(ListarPermisosUseCase);
  private readonly eliminarUseCase = inject(EliminarRolUseCase);

  readonly roles = signal<Rol[]>([]);
  readonly catalogo = signal<PermisoCatalogo[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** undefined = cerrado, null = nuevo rol. */
  readonly rolEnEdicion = signal<Rol | null | undefined>(undefined);
  readonly rolAEliminar = signal<Rol | null>(null);
  readonly eliminando = signal(false);

  /** Resumen por fila: módulos a los que da acceso cada rol. */
  readonly filas = computed(() => {
    const modulos = agruparPorModulo(this.catalogo());
    return this.roles().map(rol => {
      const propios = new Set(rol.permisos);
      return {
        rol,
        modulos: modulos.filter(m => m.permisos.some(p => propios.has(p.codigo))).map(m => m.etiqueta),
      };
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [roles, catalogo] = await Promise.all([this.listarRoles.execute(), this.listarPermisos.execute()]);
      this.roles.set(roles);
      this.catalogo.set(catalogo);
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudieron cargar los roles'));
    } finally {
      this.cargando.set(false);
    }
  }

  nuevo(): void {
    this.rolEnEdicion.set(null);
  }

  editar(rol: Rol): void {
    this.rolEnEdicion.set(rol);
  }

  cerrarFormulario(): void {
    this.rolEnEdicion.set(undefined);
  }

  onGuardado(rol: Rol, esNuevo: boolean): void {
    this.roles.update(lista => {
      const nueva = esNuevo ? [...lista, rol] : lista.map(r => (r.id === rol.id ? rol : r));
      return nueva.sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
    this.rolEnEdicion.set(undefined);
    this.toast.show(`Rol ${rol.nombre} ${esNuevo ? 'creado' : 'actualizado'}`, 'success');

    // Si cambió el rol propio, se renueva la sesión para aplicar los permisos nuevos de inmediato.
    const s = this.auth.session();
    if (!esNuevo && s && !s.superUsuario && s.rol === rol.nombre) {
      this.auth.renewToken().subscribe({ error: () => this.auth.logout() });
    }
  }

  confirmarEliminar(rol: Rol): void {
    this.rolAEliminar.set(rol);
  }

  cancelarEliminar(): void {
    if (!this.eliminando()) this.rolAEliminar.set(null);
  }

  async eliminar(): Promise<void> {
    const rol = this.rolAEliminar();
    if (!rol) return;
    this.eliminando.set(true);
    try {
      await this.eliminarUseCase.execute(rol.id);
      this.roles.update(lista => lista.filter(r => r.id !== rol.id));
      this.toast.show(`Rol ${rol.nombre} eliminado`, 'success');
      this.rolAEliminar.set(null);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo eliminar el rol'), 'error');
    } finally {
      this.eliminando.set(false);
    }
  }
}
