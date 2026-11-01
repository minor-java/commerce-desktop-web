import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';
import { VentaEnriquecida } from '../../domain/historial-ventas-caja.model';

@Injectable({ providedIn: 'root' })
export class ObtenerDetalleVentaUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(id: number): Promise<VentaEnriquecida> {
    return this.repo.obtenerDetalleVenta(id);
  }
}
