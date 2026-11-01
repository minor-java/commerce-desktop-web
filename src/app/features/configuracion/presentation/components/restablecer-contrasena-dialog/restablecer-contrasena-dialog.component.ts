import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { CONTRASENA_AYUDA, CONTRASENA_VALIDATORS } from '../../../../../shared/utils/contrasena.validators';
import { RestablecerContrasenaUseCase } from '../../../application/use-cases/restablecer-contrasena.use-case';
import { Usuario } from '../../../domain/usuario.model';

@Component({
  selector: 'app-restablecer-contrasena-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './restablecer-contrasena-dialog.component.html',
  styleUrl: './restablecer-contrasena-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class RestablecerContrasenaDialogComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Al abrir, el foco pasa al primer campo editable del diálogo.
    afterNextRender(() =>
      this.host.nativeElement
        .querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea')
        ?.focus()
    );
  }

  private readonly restablecerUseCase = inject(RestablecerContrasenaUseCase);

  readonly usuario = input.required<Usuario>();
  readonly guardado = output<Usuario>();
  readonly cerrado = output<void>();

  readonly ayudaContrasena = CONTRASENA_AYUDA;
  readonly contrasena = new FormControl('', { nonNullable: true, validators: CONTRASENA_VALIDATORS });
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  async guardar(): Promise<void> {
    this.contrasena.markAsTouched();
    if (this.contrasena.invalid || this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);
    try {
      this.guardado.emit(await this.restablecerUseCase.execute(this.usuario().id, this.contrasena.value));
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo restablecer la contraseña'));
    } finally {
      this.guardando.set(false);
    }
  }

  cerrar(): void {
    if (!this.guardando()) this.cerrado.emit();
  }
}
