import { inject, Injectable } from '@angular/core';
import { COMPRA_REPOSITORY } from '../ports/compra.repository.token';
import { CompraPaginadoRequest, CompraPaginadoResponse } from '../../domain/compra.model';

@Injectable({ providedIn: 'root' })
export class ListarComprasPaginadoUseCase {
  private readonly repo = inject(COMPRA_REPOSITORY);

  execute(request: CompraPaginadoRequest): Promise<CompraPaginadoResponse> {
    return this.repo.listarPaginado(request);
  }
}
