import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';
import { ProductoStock } from '../../domain/venta.model';

@Injectable({ providedIn: 'root' })
export class BuscarProductoStockUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(codigo: string): Promise<ProductoStock> {
    return this.repo.buscarProductoPorCodigo(codigo);
  }
}
