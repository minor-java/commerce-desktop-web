import { inject, Injectable } from '@angular/core';
import { IMPUESTO_REPOSITORY } from '../ports/impuesto.repository.token';
import { ReporteImpuestos } from '../../domain/impuesto.model';

/** Impuestos generados y devueltos en un periodo (fechas AAAA-MM-DD). Se provee en configuracion.routes. */
@Injectable()
export class GenerarReporteImpuestosUseCase {
  private readonly repo = inject(IMPUESTO_REPOSITORY);

  execute(desde: string, hasta: string): Promise<ReporteImpuestos> {
    return this.repo.reporte(desde, hasta);
  }
}
