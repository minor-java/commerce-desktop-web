import { inject, Injectable } from '@angular/core';
import { IMPRESION_REPOSITORY } from '../ports/impresion.repository.token';
import { ConfiguracionImpresion, TipoPrueba } from '../../domain/impresion.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ImprimirPruebaUseCase {
  private readonly repo = inject(IMPRESION_REPOSITORY);

  execute(config: ConfiguracionImpresion, tipo: TipoPrueba): Promise<void> {
    return this.repo.imprimirPrueba(config, tipo);
  }
}
