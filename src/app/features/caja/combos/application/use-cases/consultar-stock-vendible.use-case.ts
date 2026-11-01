import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';

@Injectable({ providedIn: 'root' })
export class ConsultarStockVendibleUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(productoId: number): Promise<number> {
    return this.repo.consultarStockVendible(productoId);
  }
}
