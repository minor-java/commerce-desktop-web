import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { Combo, CrearComboRequest } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class CrearComboUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(request: CrearComboRequest): Promise<Combo> {
    return this.repo.crear(request);
  }
}
