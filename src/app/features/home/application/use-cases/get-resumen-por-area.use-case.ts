import { inject, Injectable } from '@angular/core';
import { DASHBOARD_REPOSITORY } from '../ports/dashboard.repository.token';
import { ResumenArea } from '../../domain/dashboard.model';

@Injectable({ providedIn: 'root' })
export class GetResumenPorAreaUseCase {
  private readonly repo = inject(DASHBOARD_REPOSITORY);

  execute(): Promise<ResumenArea[]> {
    return this.repo.getResumenPorArea();
  }
}
