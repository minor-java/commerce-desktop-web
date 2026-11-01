import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';

@Injectable({ providedIn: 'root' })
export class EliminarComboUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(id: number): Promise<void> {
    return this.repo.eliminar(id);
  }
}
