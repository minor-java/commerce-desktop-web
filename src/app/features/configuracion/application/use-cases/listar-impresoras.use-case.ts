import { inject, Injectable } from '@angular/core';
import { IMPRESION_REPOSITORY } from '../ports/impresion.repository.token';
import { ImpresoraDisponible } from '../../domain/impresion.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ListarImpresorasUseCase {
  private readonly repo = inject(IMPRESION_REPOSITORY);

  execute(): Promise<ImpresoraDisponible[]> {
    return this.repo.listarImpresoras();
  }
}
