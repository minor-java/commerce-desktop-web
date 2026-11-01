import { inject, Injectable } from '@angular/core';
import { CAJA_REPOSITORY } from '../ports/caja.repository.token';
import { CajaPaginadaRequest, CajaPaginadaResponse } from '../../domain/caja-paginado.model';

@Injectable({ providedIn: 'root' })
export class ListarCajaPaginadoUseCase {
  private readonly repo = inject(CAJA_REPOSITORY);

  execute(request: CajaPaginadaRequest): Promise<CajaPaginadaResponse> {
    return this.repo.listarPaginado(request);
  }
}
