import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { CrearRolUseCase } from '../../../application/use-cases/crear-rol.use-case';
import { ActualizarRolUseCase } from '../../../application/use-cases/actualizar-rol.use-case';
import { agruparJerarquia, ModuloArbol, PermisoCatalogo, Rol, SeccionPermisos } from '../../../domain/rol.model';

@Component({
  selector: 'app-rol-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './rol-form-dialog.component.html',
  styleUrl: './rol-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class RolFormDialogComponent implements OnInit {
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
  private readonly crearUseCase = inject(CrearRolUseCase);
  private readonly actualizarUseCase = inject(ActualizarRolUseCase);

  /** null = crear rol nuevo. */
  readonly rol = input<Rol | null>(null);
  readonly catalogo = input.required<PermisoCatalogo[]>();

  readonly guardado = output<Rol>();
  readonly cerrado = output<void>();

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    descripcion: ['', Validators.maxLength(255)],
  });

  readonly seleccionados = signal<ReadonlySet<string>>(new Set());
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly intentoGuardar = signal(false);

  readonly esEdicion = computed(() => this.rol() !== null);
  readonly modulos = computed(() => agruparJerarquia(this.catalogo()));
  /** Módulos desplegados en el acordeón. */
  readonly expandidos = signal<ReadonlySet<string>>(new Set());

  private readonly porCodigo = computed(() => new Map(this.catalogo().map(p => [p.codigo, p])));
  private readonly hijosDe = computed(() => {
    const mapa = new Map<string, string[]>();
    for (const p of this.catalogo()) {
      if (p.padre) mapa.set(p.padre, [...(mapa.get(p.padre) ?? []), p.codigo]);
    }
    return mapa;
  });
  readonly sinPermisos = computed(() => this.intentoGuardar() && this.seleccionados().size === 0);

  /** Puede registrar ventas pero no cobrar con ningún método: no podría completar una venta. */
  readonly ventaSinMetodoPago = computed(() => {
    const s = this.seleccionados();
    return s.has(PERMISOS.VENTA_REGISTRAR)
      && !s.has(PERMISOS.VENTA_PAGO_EFECTIVO)
      && !s.has(PERMISOS.VENTA_PAGO_TRANSFERENCIA);
  });

  /** El rol del propio usuario no puede perder "Gestionar roles" (lo valida también el backend). */
  private readonly esRolPropio = computed(() => {
    const s = this.auth.session();
    return !!s && !s.superUsuario && this.rol()?.nombre === s.rol;
  });

  ngOnInit(): void {
    const r = this.rol();
    if (r) {
      this.form.patchValue({ nombre: r.nombre, descripcion: r.descripcion ?? '' });
      this.seleccionados.set(new Set(r.permisos));
    }
    // Al editar se despliegan los módulos que el rol usa; en un rol nuevo, todos.
    const usados = this.modulos().filter(m => this.cantidadSeleccionada(m.todos) > 0).map(m => m.modulo);
    this.expandidos.set(new Set(usados.length > 0 ? usados : this.modulos().map(m => m.modulo)));
  }

  // ─── Acordeón de módulos ──────────────────────────────────────────────

  estaExpandido(modulo: string): boolean {
    return this.expandidos().has(modulo);
  }

  alternarExpandido(modulo: string): void {
    this.expandidos.update(actual => {
      const nuevo = new Set(actual);
      if (nuevo.has(modulo)) nuevo.delete(modulo);
      else nuevo.add(modulo);
      return nuevo;
    });
  }

  // ─── Estado de permisos ───────────────────────────────────────────────

  estaSeleccionado(codigo: string): boolean {
    return this.seleccionados().has(codigo);
  }

  cantidadSeleccionada(permisos: PermisoCatalogo[]): number {
    const s = this.seleccionados();
    return permisos.filter(p => s.has(p.codigo)).length;
  }

  /**
   * Bloqueado por privilegios: un permiso que el usuario no tiene no se puede otorgar
   * (sí quitar), ni un hijo cuyo padre no se puede otorgar. Tampoco se puede quitar
   * "Gestionar roles" del rol propio.
   */
  private bloqueadoPorPrivilegio(codigo: string): boolean {
    const marcado = this.seleccionados().has(codigo);
    if (marcado && codigo === PERMISOS.CONFIG_ROLES && this.esRolPropio()) return true;
    if (marcado) return false;
    if (!this.auth.permisos().has(codigo)) return true;
    const padre = this.porCodigo().get(codigo)?.padre;
    return !!padre && this.bloqueadoPorPrivilegio(padre);
  }

  /**
   * Subopción (hijo de otra opción, no de la pantalla): no se puede marcar hasta marcar
   * su opción padre. P. ej. "Editar precio de venta" requiere "Editar productos".
   * Los hijos directos de la pantalla sí se pueden marcar y permiten la pantalla.
   */
  private padreOpcionPendiente(codigo: string): PermisoCatalogo | null {
    if (this.seleccionados().has(codigo)) return null;
    const padre = this.porCodigo().get(this.porCodigo().get(codigo)?.padre ?? '');
    if (!padre?.padre || this.seleccionados().has(padre.codigo)) return null;
    return padre;
  }

  /** Hijo de otra opción: se muestra con sangría bajo ella. */
  esSubopcion(permiso: PermisoCatalogo): boolean {
    return !!permiso.padre && !!this.porCodigo().get(permiso.padre)?.padre;
  }

  estaBloqueado(codigo: string): boolean {
    return this.bloqueadoPorPrivilegio(codigo) || this.padreOpcionPendiente(codigo) !== null;
  }

  motivoBloqueo(codigo: string): string | null {
    if (this.bloqueadoPorPrivilegio(codigo)) {
      return this.seleccionados().has(codigo)
        ? 'No puede quitar este permiso de su propio rol'
        : 'Usted no tiene este permiso, no puede otorgarlo';
    }
    const padre = this.padreOpcionPendiente(codigo);
    return padre ? `Requiere marcar «${padre.nombre}»` : null;
  }

  /**
   * Marcar un permiso marca también su padre (el componente queda permitido).
   * Desmarcarlo quita también sus hijos: sin el padre no tienen efecto.
   */
  alternar(codigo: string): void {
    if (this.estaBloqueado(codigo)) return;
    this.seleccionados.update(actual => {
      const nuevo = new Set(actual);
      if (nuevo.has(codigo)) this.quitarConHijos(nuevo, codigo);
      else this.agregarConPadres(nuevo, codigo);
      return nuevo;
    });
  }

  private agregarConPadres(set: Set<string>, codigo: string): void {
    let actual: string | null | undefined = codigo;
    while (actual && !set.has(actual)) {
      set.add(actual);
      actual = this.porCodigo().get(actual)?.padre;
    }
  }

  private quitarConHijos(set: Set<string>, codigo: string): void {
    set.delete(codigo);
    for (const hijo of this.hijosDe().get(codigo) ?? []) {
      if (set.has(hijo) && !this.bloqueadoPorPrivilegio(hijo)) this.quitarConHijos(set, hijo);
    }
  }

  // ─── Secciones (componentes) ──────────────────────────────────────────

  /** Con raíz: el check del componente es la raíz. Sin raíz: marcadas todas sus opciones. */
  seccionMarcada(seccion: SeccionPermisos): boolean {
    return seccion.raiz
      ? this.estaSeleccionado(seccion.raiz.codigo)
      : this.cantidadSeleccionada(seccion.opciones) === seccion.opciones.length;
  }

  seccionParcial(seccion: SeccionPermisos): boolean {
    if (seccion.raiz) return false;
    const n = this.cantidadSeleccionada(seccion.opciones);
    return n > 0 && n < seccion.opciones.length;
  }

  seccionPermitida(seccion: SeccionPermisos): boolean {
    return this.cantidadSeleccionada(seccion.todos) > 0;
  }

  seccionBloqueada(seccion: SeccionPermisos): boolean {
    return seccion.raiz
      ? this.estaBloqueado(seccion.raiz.codigo)
      : seccion.opciones.every(p => this.estaBloqueado(p.codigo));
  }

  estadoSeccion(seccion: SeccionPermisos): string {
    if (!this.seccionPermitida(seccion)) return 'No permitido';
    const total = seccion.opciones.length;
    if (total === 0) return 'Permitido';
    return `${this.cantidadSeleccionada(seccion.opciones)} de ${total} opciones`;
  }

  alternarSeccion(seccion: SeccionPermisos): void {
    if (seccion.raiz) {
      this.alternar(seccion.raiz.codigo);
      return;
    }
    this.marcarVarios(seccion.opciones, !this.seccionMarcada(seccion));
  }

  // ─── Módulos ──────────────────────────────────────────────────────────

  moduloCompleto(modulo: ModuloArbol): boolean {
    return this.cantidadSeleccionada(modulo.todos) === modulo.todos.length;
  }

  alternarModulo(modulo: ModuloArbol): void {
    this.marcarVarios(modulo.todos, !this.moduloCompleto(modulo));
  }

  private marcarVarios(permisos: PermisoCatalogo[], marcar: boolean): void {
    this.seleccionados.update(actual => {
      const nuevo = new Set(actual);
      for (const p of permisos) {
        // Marcar todo incluye las subopciones: sus padres se marcan en el mismo paso.
        if (this.bloqueadoPorPrivilegio(p.codigo)) continue;
        if (marcar) this.agregarConPadres(nuevo, p.codigo);
        else this.quitarConHijos(nuevo, p.codigo);
      }
      return nuevo;
    });
  }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    this.intentoGuardar.set(true);
    if (this.form.invalid || this.seleccionados().size === 0 || this.guardando()) return;

    const v = this.form.getRawValue();
    const request = {
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      permisos: [...this.seleccionados()],
    };
    this.guardando.set(true);
    this.error.set(null);
    try {
      const r = this.rol();
      this.guardado.emit(
        r ? await this.actualizarUseCase.execute(r.id, request) : await this.crearUseCase.execute(request)
      );
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo guardar el rol'));
    } finally {
      this.guardando.set(false);
    }
  }

  cerrar(): void {
    if (!this.guardando()) this.cerrado.emit();
  }
}
