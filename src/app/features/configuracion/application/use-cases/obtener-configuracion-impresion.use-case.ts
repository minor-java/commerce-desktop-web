import { inject, Injectable } from '@angular/core';
import { IMPRESION_REPOSITORY } from '../ports/impresion.repository.token';
import { ConfiguracionImpresion } from '../../domain/impresion.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ObtenerConfiguracionImpresionUseCase {
  private readonly repo = inject(IMPRESION_REPOSITORY);

  execute(): Promise<ConfiguracionImpresion> {
    return this.repo.obtener();
  }
}
