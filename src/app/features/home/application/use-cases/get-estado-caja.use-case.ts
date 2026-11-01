import { inject, Injectable } from '@angular/core';
import { DASHBOARD_REPOSITORY } from '../ports/dashboard.repository.token';

@Injectable({ providedIn: 'root' })
export class GetEstadoCajaUseCase {
  private readonly repo = inject(DASHBOARD_REPOSITORY);

  execute(usuarioId: number): Promise<boolean> {
    return this.repo.tieneCajaActiva(usuarioId);
  }
}
