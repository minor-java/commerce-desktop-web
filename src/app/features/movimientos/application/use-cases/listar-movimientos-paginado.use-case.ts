import { inject, Injectable } from '@angular/core';
import { MOVIMIENTO_REPOSITORY } from '../ports/movimiento.repository.token';
import { MovimientoPaginadoRequest, MovimientoPaginadoResponse } from '../../domain/movimiento-paginado.model';

@Injectable({ providedIn: 'root' })
export class ListarMovimientosPaginadoUseCase {
  private readonly repo = inject(MOVIMIENTO_REPOSITORY);

  execute(request: MovimientoPaginadoRequest): Promise<MovimientoPaginadoResponse> {
    return this.repo.listarPaginado(request);
  }
}
