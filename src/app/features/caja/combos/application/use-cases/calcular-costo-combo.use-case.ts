import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { CostoComboResult } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class CalcularCostoComboUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(items: { productoId: number; cantidad: number }[]): Promise<CostoComboResult> {
    return this.repo.calcularCosto(items);
  }
}
