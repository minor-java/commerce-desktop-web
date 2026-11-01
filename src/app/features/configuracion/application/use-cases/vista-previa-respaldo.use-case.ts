import { inject, Injectable } from '@angular/core';
import { RESPALDO_REPOSITORY } from '../ports/respaldo.repository.token';
import { VistaPreviaRespaldo } from '../../domain/respaldo.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class VistaPreviaRespaldoUseCase {
  private readonly repo = inject(RESPALDO_REPOSITORY);

  execute(archivo: string): Promise<VistaPreviaRespaldo> {
    return this.repo.vistaPrevia(archivo);
  }
}
