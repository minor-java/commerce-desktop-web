import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { ActualizarComboRequest, Combo } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class ActualizarComboUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(id: number, request: ActualizarComboRequest): Promise<Combo> {
    return this.repo.actualizar(id, request);
  }
}
