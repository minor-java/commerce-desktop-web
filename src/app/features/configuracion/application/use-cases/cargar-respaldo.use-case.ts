import { inject, Injectable } from '@angular/core';
import { RESPALDO_REPOSITORY } from '../ports/respaldo.repository.token';
import { VistaPreviaRespaldo } from '../../domain/respaldo.model';

/** Se provee en configuracion.routes junto al repositorio. */
@Injectable()
export class CargarRespaldoUseCase {
  private readonly repo = inject(RESPALDO_REPOSITORY);

  execute(archivo: File): Promise<VistaPreviaRespaldo> {
    return this.repo.cargar(archivo);
  }
}
