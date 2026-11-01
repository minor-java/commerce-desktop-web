import { inject, Injectable } from '@angular/core';
import { RESPALDO_REPOSITORY } from '../ports/respaldo.repository.token';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class DescargarRespaldoUseCase {
  private readonly repo = inject(RESPALDO_REPOSITORY);

  execute(archivo: string): Promise<Blob> {
    return this.repo.descargar(archivo);
  }
}
