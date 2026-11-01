import { inject, Injectable } from '@angular/core';
import { CAJA_REPOSITORY } from '../ports/caja.repository.token';
import { AbrirCajaRequest } from '../../domain/abrir-caja.model';

@Injectable({ providedIn: 'root' })
export class AbrirCajaUseCase {
  private readonly repo = inject(CAJA_REPOSITORY);

  execute(request: AbrirCajaRequest): Promise<void> {
    return this.repo.abrir(request);
  }
}
