import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ShellComponent } from './shared/layout/shell/shell.component';
import { authGuard, sesionGuard } from './core/auth/guards/auth.guard';
import { permisoGuard } from './core/auth/guards/role.guard';
import { AuthService } from './core/auth/auth.service';
import { PERMISOS } from './core/auth/permisos';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/presentation/pages/login/login.component').then(
        m => m.LoginComponent
      ),
  },
  {
    path: 'cambiar-contrasena',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./features/auth/presentation/pages/cambiar-contrasena/cambiar-contrasena.component').then(
        m => m.CambiarContrasenaComponent
      ),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).rutaInicial() },
      {
        path: 'home',
        canActivate: [permisoGuard(PERMISOS.DASHBOARD_VER)],
        loadChildren: () =>
          import('./features/home/home.routes').then(m => m.homeRoutes),
      },
      {
        path: 'catalogo',
        canActivate: [permisoGuard(PERMISOS.PRODUCTO_VER)],
        loadChildren: () =>
          import('./features/catalogo/catalogo.routes').then(m => m.catalogoRoutes),
      },
      {
        // Cada pantalla de caja exige su propio permiso (ver caja.routes).
        path: 'caja',
        loadChildren: () =>
          import('./features/caja/caja.routes').then(m => m.cajaRoutes),
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventario/inventario.routes').then(m => m.inventarioRoutes),
      },
      {
        path: 'movimientos',
        canActivate: [permisoGuard(PERMISOS.MOVIMIENTO_VER)],
        loadChildren: () =>
          import('./features/movimientos/movimientos.routes').then(m => m.movimientosRoutes),
      },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./features/configuracion/configuracion.routes').then(m => m.configuracionRoutes),
      },
      {
        path: 'sin-acceso',
        loadComponent: () =>
          import('./shared/components/sin-acceso/sin-acceso.component').then(m => m.SinAccesoComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
