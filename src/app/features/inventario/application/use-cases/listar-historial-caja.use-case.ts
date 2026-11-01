import { inject, Injectable } from '@angular/core';
import { HISTORIAL_CAJA_REPOSITORY } from '../ports/historial-caja.repository.token';
import { HistorialCajaPaginadoRequest, HistorialCajaPaginadoResponse } from '../../domain/historial-caja.model';

@Injectable({ providedIn: 'root' })
export class ListarHistorialCajaUseCase {
  private readonly repo = inject(HISTORIAL_CAJA_REPOSITORY);

  execute(request: HistorialCajaPaginadoRequest): Promise<HistorialCajaPaginadoResponse> {
    return this.repo.listarPaginado(request);
  }
}
