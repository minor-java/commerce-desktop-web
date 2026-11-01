import { inject, Injectable } from '@angular/core';
import { VENTA_DETALLE_CAJA_REPOSITORY } from '../ports/venta-detalle-caja.repository.token';
import { VentaDetalleCaja } from '../../domain/detalle-caja.model';

@Injectable({ providedIn: 'root' })
export class ConsultarVentaDetalleCajaUseCase {
  private readonly repo = inject(VENTA_DETALLE_CAJA_REPOSITORY);

  execute(ventaId: number): Promise<VentaDetalleCaja> {
    return this.repo.obtenerDetalle(ventaId);
  }
}
