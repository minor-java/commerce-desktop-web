import { inject, Injectable } from '@angular/core';
import { COMPRA_REPOSITORY } from '../ports/compra.repository.token';
import { GuardarCompraRequest } from '../../domain/compra.model';

@Injectable({ providedIn: 'root' })
export class GuardarCompraUseCase {
  private readonly repo = inject(COMPRA_REPOSITORY);

  execute(request: GuardarCompraRequest): Promise<void> {
    return this.repo.guardarCompra(request);
  }
}
