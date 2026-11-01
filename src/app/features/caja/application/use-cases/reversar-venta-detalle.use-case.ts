import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';

@Injectable({ providedIn: 'root' })
export class ReversarVentaDetalleUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(ventaDetalleId: number, cantidadReversada: number, observacion?: string): Promise<void> {
    return this.repo.reversarVentaDetalle(ventaDetalleId, cantidadReversada, observacion);
  }
}
