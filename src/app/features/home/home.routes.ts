import { Routes } from '@angular/router';
import { DASHBOARD_REPOSITORY } from './application/ports/dashboard.repository.token';
import { DashboardApi } from './infrastructure/api/dashboard.api';

export const homeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/pages/home/home.component').then(m => m.HomeComponent),
    providers: [
      { provide: DASHBOARD_REPOSITORY, useClass: DashboardApi },
    ],
  },
];
