import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/auth.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { CONTRASENA_AYUDA, CONTRASENA_VALIDATORS } from '../../../../../shared/utils/contrasena.validators';
import { CrearUsuarioUseCase } from '../../../application/use-cases/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from '../../../application/use-cases/actualizar-usuario.use-case';
import { Usuario } from '../../../domain/usuario.model';
import { Rol } from '../../../domain/rol.model';

@Component({
  selector: 'app-usuario-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form-dialog.component.html',
  styleUrl: './usuario-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class UsuarioFormDialogComponent implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Al abrir, el foco pasa al primer campo editable del diálogo.
    afterNextRender(() =>
      this.host.nativeElement
        .querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea')
        ?.focus()
    );
  }

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly crearUseCase = inject(CrearUsuarioUseCase);
  private readonly actualizarUseCase = inject(ActualizarUsuarioUseCase);

  /** null = crear usuario nuevo. */
  readonly usuario = input<Usuario | null>(null);
  readonly roles = input.required<Rol[]>();

  readonly guardado = output<Usuario>();
  readonly cerrado = output<void>();

  readonly ayudaContrasena = CONTRASENA_AYUDA;
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  readonly esEdicion = computed(() => this.usuario() !== null);
  /** Nadie puede cambiar su propio rol ni desactivarse (lo valida también el backend). */
  readonly esUsuarioActual = computed(() => this.usuario()?.id === this.auth.session()?.usuarioId);

  /** Solo se pueden asignar roles cuyos permisos tiene quien opera. */
  readonly rolesOpciones = computed(() => {
    const propios = this.auth.permisos();
    return this.roles().map(rol => {
      const asignable = rol.permisos.every(p => propios.has(p));
      return {
        rol,
        asignable,
        etiqueta: asignable ? rol.nombre : `${rol.nombre} (requiere permisos que usted no tiene)`,
      };
    });
  });

  readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,50}$/)]],
    nombre: ['', Validators.maxLength(100)],
    rolId: [null as number | null, Validators.required],
    contrasena: ['', CONTRASENA_VALIDATORS],
    activo: [true],
  });

  ngOnInit(): void {
    const u = this.usuario();
    if (!u) return;
    this.form.patchValue({ usuario: u.usuario, nombre: u.nombre ?? '', rolId: u.rolId, activo: u.activo });
    this.form.controls.usuario.disable();
    this.form.controls.contrasena.disable();
    if (this.esUsuarioActual()) {
      this.form.controls.rolId.disable();
      this.form.controls.activo.disable();
    }
  }

  mostrarError(control: 'usuario' | 'rolId' | 'contrasena'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    const v = this.form.getRawValue();
    const nombre = v.nombre.trim() || null;
    this.guardando.set(true);
    this.error.set(null);
    try {
      const u = this.usuario();
      const resultado = u
        ? await this.actualizarUseCase.execute(u.id, { nombre, rolId: v.rolId!, activo: v.activo })
        : await this.crearUseCase.execute({
            usuario: v.usuario.trim(),
            nombre,
            contrasena: v.contrasena,
            rolId: v.rolId!,
            activo: v.activo,
          });
      this.guardado.emit(resultado);
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo guardar el usuario'));
    } finally {
      this.guardando.set(false);
    }
  }

  cerrar(): void {
    if (!this.guardando()) this.cerrado.emit();
  }
}
