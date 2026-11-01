import { inject, Injectable } from '@angular/core';
import { RESPALDO_REPOSITORY } from '../ports/respaldo.repository.token';
import { Respaldo } from '../../domain/respaldo.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ListarRespaldosUseCase {
  private readonly repo = inject(RESPALDO_REPOSITORY);

  execute(): Promise<Respaldo[]> {
    return this.repo.listar();
  }
}
