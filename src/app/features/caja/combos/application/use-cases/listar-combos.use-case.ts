import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { ComboPaginadoRequest, ComboPaginadoResponse } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class ListarCombosUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(request: ComboPaginadoRequest): Promise<ComboPaginadoResponse> {
    return this.repo.buscarPaginado(request);
  }
}
