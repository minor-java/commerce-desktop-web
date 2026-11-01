import { inject, Injectable } from '@angular/core';
import { PRODUCTO_REPOSITORY } from '../../ports/producto.repository.token';
import { GenerarCodigoBarraResponse } from '../../../domain/codigo-barra.model';

@Injectable({ providedIn: 'root' })
export class GenerarCodigoBarrasUseCase {
  private readonly repo = inject(PRODUCTO_REPOSITORY);

  execute(): Promise<GenerarCodigoBarraResponse> {
    return this.repo.generarCodigoBarras();
  }
}
