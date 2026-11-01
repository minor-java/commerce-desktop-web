import { inject, Injectable } from '@angular/core';
import { PERDIDA_REPOSITORY } from '../ports/perdida.repository.token';
import { RegistrarPerdidaRequest } from '../../domain/perdida.model';

@Injectable({ providedIn: 'root' })
export class RegistrarPerdidaUseCase {
  private readonly repo = inject(PERDIDA_REPOSITORY);

  execute(request: RegistrarPerdidaRequest): Promise<void> {
    return this.repo.registrar(request);
  }
}
