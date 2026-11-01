import { inject, Injectable } from '@angular/core';
import { LOG_REPOSITORY } from '../ports/log.repository.token';
import { DiaLog } from '../../domain/log.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class ListarLogsUseCase {
  private readonly repo = inject(LOG_REPOSITORY);

  execute(): Promise<DiaLog[]> {
    return this.repo.listar();
  }
}
