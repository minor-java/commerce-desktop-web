import { inject, Injectable } from '@angular/core';
import { MOVIMIENTO_REPOSITORY } from '../ports/movimiento.repository.token';
import { AplicarReversoResponse } from '../../domain/reverso.model';

@Injectable({ providedIn: 'root' })
export class AplicarReversoUseCase {
  private readonly repo = inject(MOVIMIENTO_REPOSITORY);

  execute(movimientoId: number): Promise<AplicarReversoResponse> {
    return this.repo.aplicarReverso({ movimientoId });
  }
}
