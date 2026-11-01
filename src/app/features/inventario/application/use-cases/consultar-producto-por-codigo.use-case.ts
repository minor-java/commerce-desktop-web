import { inject, Injectable } from '@angular/core';
import { COMPRA_REPOSITORY } from '../ports/compra.repository.token';
import { ProductoEscaneado } from '../../domain/compra.model';

@Injectable({ providedIn: 'root' })
export class ConsultarProductoPorCodigoUseCase {
  private readonly repo = inject(COMPRA_REPOSITORY);

  execute(codigo: string): Promise<ProductoEscaneado> {
    return this.repo.consultarProductoPorCodigo(codigo);
  }
}
