import { inject, Injectable } from '@angular/core';
import { PRODUCTO_REPOSITORY } from '../../ports/producto.repository.token';
import { GuardarProductoRequest } from '../../../domain/guardar-producto.model';

@Injectable({ providedIn: 'root' })
export class GuardarProductoUseCase {
  private readonly repo = inject(PRODUCTO_REPOSITORY);

  execute(request: GuardarProductoRequest): Promise<void> {
    return this.repo.guardar(request);
  }
}
