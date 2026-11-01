import { inject, Injectable } from '@angular/core';
import { IMPRESION_REPOSITORY } from '../ports/impresion.repository.token';
import { ConfiguracionImpresion, ResultadoConexion } from '../../domain/impresion.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ProbarConexionImpresoraUseCase {
  private readonly repo = inject(IMPRESION_REPOSITORY);

  execute(config: ConfiguracionImpresion): Promise<ResultadoConexion> {
    return this.repo.probarConexion(config);
  }
}
