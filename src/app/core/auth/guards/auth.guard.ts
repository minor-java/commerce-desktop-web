import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, RUTA_CAMBIAR_CONTRASENA } from '../auth.service';

/** Exige sesión válida; con cambio de contraseña pendiente solo deja ir a esa pantalla. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  if (auth.debeCambiarContrasena()) return router.createUrlTree([RUTA_CAMBIAR_CONTRASENA]);
  return true;
};

/** Pantalla de cambio de contraseña: requiere sesión, aunque el cambio esté pendiente. */
export const sesionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
