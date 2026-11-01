import { inject, Injectable } from '@angular/core';
import { CAJA_REPOSITORY } from '../ports/caja.repository.token';
import { Caja } from '../../domain/caja.model';
import { CerrarCajaRequest } from '../../domain/cerrar-caja.model';

@Injectable({ providedIn: 'root' })
export class CerrarCajaUseCase {
  private readonly repo = inject(CAJA_REPOSITORY);

  execute(request: CerrarCajaRequest): Promise<Caja> {
    return this.repo.cerrar(request);
  }
}
