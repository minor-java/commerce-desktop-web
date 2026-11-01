import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { GenerarCodigoBarraResponse } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class GenerarCodigoBarrasUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(): Promise<GenerarCodigoBarraResponse> {
    return this.repo.generarCodigoBarras();
  }
}
