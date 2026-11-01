import { ValidatorFn, Validators } from '@angular/forms';

/** Misma política que valida el backend (PoliticaContrasena.java). */
export const CONTRASENA_MIN = 6;
export const CONTRASENA_MAX = 72;

export const CONTRASENA_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(CONTRASENA_MIN),
  Validators.maxLength(CONTRASENA_MAX),
  Validators.pattern(/^(?=.*\p{L})(?=.*\d).+$/u),
];

export const CONTRASENA_AYUDA = `Mínimo ${CONTRASENA_MIN} caracteres, con letras y números.`;
