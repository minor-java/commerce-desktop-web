import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/auth/guards/role.guard';
import { PERMISOS } from '../../core/auth/permisos';

export const catalogoRoutes: Routes = [
  {
    path: 'producto',
    loadComponent: () =>
      import('./presentation/pages/producto/producto.component').then(
        m => m.ProductoComponent
      ),
  },
  {
    path: 'crear-producto',
    canActivate: [permisoGuard(PERMISOS.PRODUCTO_CREAR)],
    loadComponent: () =>
      import('./presentation/pages/crear-producto/crear-producto.component').then(
        m => m.CrearProductoComponent
      ),
  },
  {
    path: 'editar-producto',
    canActivate: [permisoGuard(PERMISOS.PRODUCTO_EDITAR)],
    loadComponent: () =>
      import('./presentation/pages/editar-producto/editar-producto.component').then(
        m => m.EditarProductoComponent
      ),
  },
];
