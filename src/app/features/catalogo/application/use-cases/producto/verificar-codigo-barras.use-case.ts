import { inject, Injectable } from '@angular/core';
import { PRODUCTO_REPOSITORY } from '../../ports/producto.repository.token';
import { ExisteCodigoBarrasResponse } from '../../../domain/actualizar-producto.model';

@Injectable({ providedIn: 'root' })
export class VerificarCodigoBarrasUseCase {
  private readonly repo = inject(PRODUCTO_REPOSITORY);

  execute(codigo: string): Promise<ExisteCodigoBarrasResponse> {
    return this.repo.existePorCodigoBarras(codigo);
  }
}
