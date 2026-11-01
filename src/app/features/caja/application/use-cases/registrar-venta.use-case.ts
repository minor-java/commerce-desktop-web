import { inject, Injectable } from '@angular/core';
import { VENTA_REPOSITORY } from '../ports/venta.repository.token';
import { RegistrarVentaRequest, VentaResponse } from '../../domain/venta.model';

@Injectable({ providedIn: 'root' })
export class RegistrarVentaUseCase {
  private readonly repo = inject(VENTA_REPOSITORY);

  execute(request: RegistrarVentaRequest): Promise<VentaResponse> {
    return this.repo.registrarVenta(request);
  }
}
