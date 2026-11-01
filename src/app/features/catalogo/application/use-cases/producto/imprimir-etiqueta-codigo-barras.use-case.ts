import { inject, Injectable } from '@angular/core';
import { PRODUCTO_REPOSITORY } from '../../ports/producto.repository.token';
import { ImprimirEtiquetaCodigoBarraResponse } from '../../../domain/codigo-barra.model';

@Injectable({ providedIn: 'root' })
export class ImprimirEtiquetaCodigoBarrasUseCase {
  private readonly repo = inject(PRODUCTO_REPOSITORY);

  execute(codigo: string, nombre: string, cantidad: number): Promise<ImprimirEtiquetaCodigoBarraResponse> {
    return this.repo.imprimirEtiquetaCodigoBarra(codigo, nombre, cantidad);
  }
}
