import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/auth/guards/role.guard';
import { PERMISOS } from '../../core/auth/permisos';

export const inventarioRoutes: Routes = [
  {
    path: '',
    redirectTo: 'stock',
    pathMatch: 'full',
  },
  {
    path: 'stock',
    canActivate: [permisoGuard(PERMISOS.STOCK_VER)],
    loadComponent: () =>
      import('./presentation/pages/stock/stock.component').then(m => m.StockComponent),
  },
  {
    path: 'compra',
    canActivate: [permisoGuard(PERMISOS.COMPRA_VER)],
    loadComponent: () =>
      import('./presentation/pages/compra/compra.component').then(m => m.CompraComponent),
  },
  {
    path: 'nueva-compra',
    canActivate: [permisoGuard(PERMISOS.COMPRA_CREAR)],
    loadComponent: () =>
      import('./presentation/pages/nueva-compra/nueva-compra.component').then(m => m.NuevaCompraComponent),
  },
  {
    path: 'historial-caja',
    canActivate: [permisoGuard(PERMISOS.CAJA_HISTORIAL)],
    loadComponent: () =>
      import('./presentation/pages/historial-caja/historial-caja.component').then(m => m.HistorialCajaInventarioComponent),
  },
  {
    path: 'historial-caja/:id',
    canActivate: [permisoGuard(PERMISOS.CAJA_HISTORIAL)],
    loadComponent: () =>
      import('./presentation/pages/detalle-caja/detalle-caja.component').then(m => m.DetalleCajaComponent),
  },
  {
    path: 'perdidas',
    canActivate: [permisoGuard(PERMISOS.PERDIDA_GESTIONAR)],
    loadComponent: () =>
      import('./presentation/pages/perdidas/perdidas.component').then(m => m.PerdidasComponent),
  },
];
