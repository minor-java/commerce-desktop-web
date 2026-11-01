import { inject, Injectable } from '@angular/core';
import { ParametrosVenta } from '../../../../core/negocio/negocio.model';
import { IMPUESTO_REPOSITORY } from '../ports/impuesto.repository.token';

/** Configuración > Parámetros de venta. Se provee en configuracion.routes. */
@Injectable()
export class ParametrosVentaUseCase {
  private readonly repo = inject(IMPUESTO_REPOSITORY);

  obtener(): Promise<ParametrosVenta> {
    return this.repo.obtenerParametrosVenta();
  }

  guardar(request: ParametrosVenta): Promise<ParametrosVenta> {
    return this.repo.guardarParametrosVenta(request);
  }
}
