import { inject, Injectable } from '@angular/core';
import { PRODUCTO_REPOSITORY } from '../../ports/producto.repository.token';
import { ActualizarProductoRequest } from '../../../domain/actualizar-producto.model';

export interface ActualizarProductoCommand {
  producto: ActualizarProductoRequest;
  idsAEliminar: number[];
  nuevosCodigosBarras: string[];
}

@Injectable({ providedIn: 'root' })
export class ActualizarProductoUseCase {
  private readonly repo = inject(PRODUCTO_REPOSITORY);

  async execute(command: ActualizarProductoCommand): Promise<void> {
    const tasks: Promise<void>[] = [this.repo.actualizar(command.producto)];

    if (command.idsAEliminar.length > 0) {
      tasks.push(this.repo.eliminarCodigosBarras({ ids: command.idsAEliminar }));
    }

    if (command.nuevosCodigosBarras.length > 0) {
      tasks.push(
        this.repo.guardarCodigosBarras({
          productoId: command.producto.id,
          codigos: command.nuevosCodigosBarras,
        })
      );
    }

    await Promise.all(tasks);
  }
}
