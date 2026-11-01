import { InjectionToken } from '@angular/core';
import { DashboardRepository } from './dashboard.repository';

export const DASHBOARD_REPOSITORY = new InjectionToken<DashboardRepository>('DASHBOARD_REPOSITORY');
