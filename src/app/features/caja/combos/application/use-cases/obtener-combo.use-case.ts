import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { Combo } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class ObtenerComboUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(id: number): Promise<Combo> {
    return this.repo.obtenerPorId(id);
  }
}
