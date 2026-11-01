import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/auth/guards/role.guard';
import { PERMISOS } from '../../core/auth/permisos';

export const cajaRoutes: Routes = [
  {
    path: '',
    redirectTo: 'caja',
    pathMatch: 'full',
  },
  {
    path: 'nueva-venta',
    canActivate: [permisoGuard(PERMISOS.VENTA_REGISTRAR)],
    loadComponent: () =>
      import('./presentation/pages/nueva-venta/nueva-venta.component').then(
        m => m.NuevaVentaComponent
      ),
  },
  {
    path: 'caja',
    canActivate: [permisoGuard(PERMISOS.CAJA_OPERAR)],
    loadComponent: () =>
      import('./presentation/pages/caja/caja.component').then(m => m.CajaComponent),
  },
  {
    path: 'historial',
    canActivate: [permisoGuard(PERMISOS.CAJA_HISTORIAL)],
    loadComponent: () =>
      import('./presentation/pages/historial-caja/historial-caja.component').then(
        m => m.HistorialCajaComponent
      ),
  },
  {
    path: 'historial-ventas',
    canActivate: [permisoGuard(PERMISOS.VENTA_HISTORIAL)],
    loadComponent: () =>
      import('./presentation/pages/historial-ventas-caja/historial-ventas-caja.component').then(
        m => m.HistorialVentasCajaComponent
      ),
  },
  {
    path: 'historial-ventas/:id',
    canActivate: [permisoGuard(PERMISOS.VENTA_HISTORIAL)],
    loadComponent: () =>
      import('./presentation/pages/detalle-venta-caja/detalle-venta-caja.component').then(
        m => m.DetalleVentaCajaComponent
      ),
  },
  {
    path: 'devoluciones',
    canActivate: [permisoGuard(PERMISOS.VENTA_DEVOLUCION)],
    loadComponent: () =>
      import('./presentation/pages/devoluciones/devoluciones.component').then(
        m => m.DevolucionesComponent
      ),
  },
  {
    path: 'combos',
    canActivate: [permisoGuard(PERMISOS.COMBO_GESTIONAR)],
    loadComponent: () =>
      import('./combos/presentation/pages/combos/combos.component').then(
        m => m.CombosComponent
      ),
  },
];
