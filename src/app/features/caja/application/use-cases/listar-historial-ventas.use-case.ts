import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';
import { HistorialVentasRequest, HistorialVentasResponse } from '../../domain/historial-ventas-caja.model';

@Injectable({ providedIn: 'root' })
export class ListarHistorialVentasUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(request: HistorialVentasRequest): Promise<HistorialVentasResponse> {
    return this.repo.listarHistorialVentas(request);
  }
}
