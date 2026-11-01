import { inject, Injectable } from '@angular/core';
import { ESTILO_REPOSITORY } from '../ports/estilo.repository.token';
import { ConfiguracionEstilo } from '../../domain/estilo.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class GuardarEstiloUseCase {
  private readonly repo = inject(ESTILO_REPOSITORY);

  execute(estilo: ConfiguracionEstilo): Promise<ConfiguracionEstilo> {
    return this.repo.guardar(estilo);
  }
}
