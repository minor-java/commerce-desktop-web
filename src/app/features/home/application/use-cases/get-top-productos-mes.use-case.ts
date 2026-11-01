import { inject, Injectable } from '@angular/core';
import { DASHBOARD_REPOSITORY } from '../ports/dashboard.repository.token';
import { TopProducto } from '../../domain/dashboard.model';

@Injectable({ providedIn: 'root' })
export class GetTopProductosMesUseCase {
  private readonly repo = inject(DASHBOARD_REPOSITORY);

  execute(): Promise<TopProducto[]> {
    return this.repo.getTopProductosMes();
  }
}
