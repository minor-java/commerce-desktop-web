import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/auth/auth.service';
import { TemaService } from '../../../../../core/tema/tema.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly tema = inject(TemaService);

  /** Nombre corto de una palabra: se reparte letra por letra a lo ancho del logo. */
  protected readonly letrasNombre = computed(() => {
    const nombre = this.tema.nombreNegocio().trim();
    return nombre.length >= 2 && nombre.length <= 12 && !/\s/.test(nombre) ? [...nombre.toUpperCase()] : null;
  });

  readonly form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  async submit(): Promise<void> {
    if (this.loading()) return;

    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl(this.auth.rutaInicial());
    } catch (err) {
      // El backend distingue credenciales inválidas, usuario bloqueado, inactivo o sin rol.
      this.error.set(extraerMensajeError(err, 'Usuario o contraseña no válidos'));
    } finally {
      this.loading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
