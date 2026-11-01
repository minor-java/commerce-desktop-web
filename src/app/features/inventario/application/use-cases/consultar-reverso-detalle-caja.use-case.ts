import { inject, Injectable } from '@angular/core';
import { REVERSO_DETALLE_CAJA_REPOSITORY } from '../ports/reverso-detalle-caja.repository.token';
import { ReversoDetalleCaja } from '../../domain/detalle-caja.model';

@Injectable({ providedIn: 'root' })
export class ConsultarReversoDetalleCajaUseCase {
  private readonly repo = inject(REVERSO_DETALLE_CAJA_REPOSITORY);

  execute(reversoId: number): Promise<ReversoDetalleCaja> {
    return this.repo.obtenerDetalle(reversoId);
  }
}
