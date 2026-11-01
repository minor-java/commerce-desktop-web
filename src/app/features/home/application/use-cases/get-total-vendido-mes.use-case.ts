import { inject, Injectable } from '@angular/core';
import { DASHBOARD_REPOSITORY } from '../ports/dashboard.repository.token';

@Injectable({ providedIn: 'root' })
export class GetTotalVendidoMesUseCase {
  private readonly repo = inject(DASHBOARD_REPOSITORY);

  execute(areaNegocioId?: number): Promise<number> {
    return this.repo.getTotalVendidoMes(areaNegocioId);
  }
}
