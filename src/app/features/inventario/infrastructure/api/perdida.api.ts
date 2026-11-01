import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PerdidaRepository } from '../../application/ports/perdida.repository';
import {
  PerdidaItem,
  PerdidaPaginadoRequest,
  PerdidaPaginadoResponse,
  RegistrarPerdidaRequest,
} from '../../domain/perdida.model';

interface ProductoMovimientoDto {
  productoId: number;
  nombre: string | null;
}

interface MovimientoPerdidaDto {
  id: number;
  productoId: number;
  producto: ProductoMovimientoDto | null;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  fechaCreacion: string;
}

interface PaginadoDto<T> {
  contenido: T[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class PerdidaApi implements PerdidaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/movimientos`;

  async registrar(request: RegistrarPerdidaRequest): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/perdida`, request, { observe: 'response' })
    );
  }

  async listarPaginado(request: PerdidaPaginadoRequest): Promise<PerdidaPaginadoResponse> {
    const dto = await firstValueFrom(
      this.http.post<PaginadoDto<MovimientoPerdidaDto>>(this.baseUrl, {
        referenciaTipo: 'PERDIDA',
        page: request.page,
        size: request.size,
      })
    );

    const contenido: PerdidaItem[] = dto.contenido.map(m => ({
      id: m.id,
      productoId: m.productoId,
      nombreProducto: m.producto?.nombre ?? null,
      cantidad: m.cantidad,
      costoUnitario: m.costoUnitario,
      costoTotal: m.costoTotal,
      fechaCreacion: m.fechaCreacion,
    }));

    return {
      contenido,
      totalRows: dto.totalRows,
      page: dto.page,
      size: dto.size,
      totalPages: dto.totalPages,
    };
  }
}
