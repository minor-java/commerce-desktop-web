import { inject, Injectable } from '@angular/core';
import { IMPRESION_REPOSITORY } from '../ports/impresion.repository.token';
import { ConfiguracionImpresion, LineaTicket } from '../../domain/impresion.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class VistaPreviaReciboUseCase {
  private readonly repo = inject(IMPRESION_REPOSITORY);

  execute(config: ConfiguracionImpresion): Promise<LineaTicket[]> {
    return this.repo.vistaPrevia(config);
  }
}
