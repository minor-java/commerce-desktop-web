import { inject, Injectable } from '@angular/core';
import { PERDIDA_REPOSITORY } from '../ports/perdida.repository.token';
import { PerdidaPaginadoRequest, PerdidaPaginadoResponse } from '../../domain/perdida.model';

@Injectable({ providedIn: 'root' })
export class ListarPerdidasUseCase {
  private readonly repo = inject(PERDIDA_REPOSITORY);

  execute(request: PerdidaPaginadoRequest): Promise<PerdidaPaginadoResponse> {
    return this.repo.listarPaginado(request);
  }
}
