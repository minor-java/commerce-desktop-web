import { inject, Injectable } from '@angular/core';
import { CAJA_REPOSITORY } from '../ports/caja.repository.token';
import { Caja } from '../../domain/caja.model';

@Injectable({ providedIn: 'root' })
export class ConsultarCajaUseCase {
  private readonly repo = inject(CAJA_REPOSITORY);

  execute(): Promise<Caja | null> {
    return this.repo.consultar();
  }
}
