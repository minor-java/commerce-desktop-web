import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';

@Injectable({ providedIn: 'root' })
export class VerificarCodigoBarrasUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(codigo: string): Promise<boolean> {
    return this.repo.verificarCodigoExiste(codigo);
  }
}
