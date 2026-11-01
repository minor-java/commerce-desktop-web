import { inject, Injectable } from '@angular/core';
import { COMBO_REPOSITORY } from '../ports/combo.repository.token';
import { ImprimirEtiquetaCodigoBarraResponse } from '../../domain/combo.model';

@Injectable({ providedIn: 'root' })
export class ImprimirEtiquetaCodigoBarrasUseCase {
  private readonly repo = inject(COMBO_REPOSITORY);

  execute(codigo: string, nombre: string, cantidad: number): Promise<ImprimirEtiquetaCodigoBarraResponse> {
    return this.repo.imprimirEtiquetaCodigoBarra(codigo, nombre, cantidad);
  }
}
