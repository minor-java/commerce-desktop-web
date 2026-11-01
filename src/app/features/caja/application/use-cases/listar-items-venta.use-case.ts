import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';
import { ProductoPaginadoRequest, ProductoPaginadoResponse } from '../../../catalogo/domain/producto-paginado.model';

@Injectable({ providedIn: 'root' })
export class ListarItemsVentaUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(request: ProductoPaginadoRequest): Promise<ProductoPaginadoResponse> {
    return this.repo.listarItemsVenta(request);
  }
}
