import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Permiso } from '../permisos';

/**
 * Permite la ruta si el usuario tiene al menos uno de los permisos.
 * Si no, lo envía a la primera pantalla a la que sí tiene acceso.
 * Es solo navegación: el backend vuelve a validar cada permiso.
 */
export function permisoGuard(...permisos: Permiso[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
    if (auth.tieneAlgunPermiso(permisos)) return true;
    return router.parseUrl(auth.rutaInicial());
  };
}
