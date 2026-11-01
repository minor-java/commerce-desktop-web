import { inject, Injectable } from '@angular/core';
import { DASHBOARD_REPOSITORY } from '../ports/dashboard.repository.token';
import { UltimaVenta } from '../../domain/dashboard.model';

@Injectable({ providedIn: 'root' })
export class GetUltimasVentasUseCase {
  private readonly repo = inject(DASHBOARD_REPOSITORY);

  execute(): Promise<UltimaVenta[]> {
    return this.repo.getUltimasVentas();
  }
}
