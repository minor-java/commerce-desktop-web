import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';
import { VentaDevolucion } from '../../domain/historial-ventas-caja.model';

@Injectable({ providedIn: 'root' })
export class ConsultarVentaDevolucionUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(id: number): Promise<VentaDevolucion> {
    return this.repo.consultarParaDevolucion(id);
  }
}
