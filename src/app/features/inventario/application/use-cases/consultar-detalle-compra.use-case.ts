import { inject, Injectable } from '@angular/core';
import { COMPRA_REPOSITORY } from '../ports/compra.repository.token';
import { CompraDetalle } from '../../domain/compra.model';

@Injectable({ providedIn: 'root' })
export class ConsultarDetalleCompraUseCase {
  private readonly repo = inject(COMPRA_REPOSITORY);

  execute(compraId: number): Promise<CompraDetalle[]> {
    return this.repo.consultarDetalle(compraId);
  }
}
