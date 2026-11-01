import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { CONTRASENA_VALIDATORS } from '../../../../../shared/utils/contrasena.validators';

const coincidenValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const nueva = group.get('nueva')?.value;
  const confirmar = group.get('confirmar')?.value;
  return nueva && confirmar && nueva !== confirmar ? { noCoinciden: true } : null;
};

@Component({
  selector: 'app-cambiar-contrasena',
  imports: [ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrl: './cambiar-contrasena.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CambiarContrasenaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Cambio obligatorio (primer ingreso o contraseña restablecida): no se puede cancelar. */
  readonly obligatorio = computed(() => this.auth.debeCambiarContrasena());
  readonly usuario = computed(() => this.auth.session()?.usuario ?? '');

  readonly form = this.fb.nonNullable.group(
    {
      actual: ['', Validators.required],
      nueva: ['', CONTRASENA_VALIDATORS],
      confirmar: ['', Validators.required],
    },
    { validators: coincidenValidator }
  );

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.error.set(null);
    this.loading.set(true);
    try {
      const { actual, nueva } = this.form.getRawValue();
      await this.auth.cambiarContrasena({ actual, nueva });
      this.toast.show('Contraseña actualizada correctamente', 'success');
      await this.router.navigateByUrl(this.auth.rutaInicial());
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo cambiar la contraseña'));
    } finally {
      this.loading.set(false);
    }
  }

  cancelar(): void {
    if (this.obligatorio()) {
      this.auth.logout();
      return;
    }
    this.router.navigateByUrl(this.auth.rutaInicial());
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  mostrarError(control: 'actual' | 'nueva' | 'confirmar'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
