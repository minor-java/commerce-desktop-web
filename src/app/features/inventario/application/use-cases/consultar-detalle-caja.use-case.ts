import { inject, Injectable } from '@angular/core';
import { DETALLE_CAJA_REPOSITORY } from '../ports/detalle-caja.repository.token';
import { MovimientoCajaItem } from '../../domain/detalle-caja.model';

@Injectable({ providedIn: 'root' })
export class ConsultarDetalleCajaUseCase {
  private readonly repo = inject(DETALLE_CAJA_REPOSITORY);

  execute(cajaId: number): Promise<MovimientoCajaItem[]> {
    return this.repo.consultarMovimientos(cajaId);
  }
}
