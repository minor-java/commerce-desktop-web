import { inject, Injectable } from '@angular/core';
import { LOG_REPOSITORY } from '../ports/log.repository.token';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class DescargarLogsUseCase {
  private readonly repo = inject(LOG_REPOSITORY);

  execute(): Promise<Blob> {
    return this.repo.descargarTodos();
  }
}
