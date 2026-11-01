import { inject, Injectable } from '@angular/core';
import { PRODUCTO_REPOSITORY } from '../../ports/producto.repository.token';
import { ProductoPaginadoRequest, ProductoPaginadoResponse } from '../../../domain/producto-paginado.model';

@Injectable({ providedIn: 'root' })
export class ListarProductosPaginadoUseCase {
  private readonly repo = inject(PRODUCTO_REPOSITORY);

  execute(request: ProductoPaginadoRequest): Promise<ProductoPaginadoResponse> {
    return this.repo.listarPaginado(request);
  }
}
