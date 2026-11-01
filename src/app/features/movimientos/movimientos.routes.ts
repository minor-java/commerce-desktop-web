import { Routes } from '@angular/router';

export const movimientosRoutes: Routes = [
  {
    path: 'movimientos',
    loadComponent: () =>
      import('./presentation/pages/movimientos/movimientos.component').then(
        m => m.MovimientosComponent
      ),
  },
];
