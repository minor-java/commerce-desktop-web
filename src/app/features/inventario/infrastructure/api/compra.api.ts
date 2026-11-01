import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CompraRepository } from '../../application/ports/compra.repository';
import { environment } from '../../../../../environments/environment';
import { CompraDetalle, CompraPaginadoRequest, CompraPaginadoResponse, GuardarCompraRequest, ProductoEscaneado } from '../../domain/compra.model';
import { CompraDetalleDto, CompraPaginadoResponseDto } from '../dto/compra.dto';
import { mapCompraDetalle, mapCompraItem } from '../mappers/compra.mapper';

@Injectable()
export class CompraApi implements CompraRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/compra`;
  private readonly catalogoBaseUrl = `${environment.apiUrl}/catalogo`;

  async listarPaginado(request: CompraPaginadoRequest): Promise<CompraPaginadoResponse> {
    const dto = await firstValueFrom(
      this.http.post<CompraPaginadoResponseDto>(`${this.baseUrl}/paginado`, request)
    );
    return {
      contenido: dto.contenido.map(mapCompraItem),
      totalRows: dto.totalRows,
      page: dto.page,
      size: dto.size,
      totalPages: dto.totalPages,
    };
  }

  async consultarDetalle(compraId: number): Promise<CompraDetalle[]> {
    const dtos = await firstValueFrom(
      this.http.get<CompraDetalleDto[]>(
        `${this.baseUrl}/consulta-detalle-por-compra-id/${compraId}`
      )
    );
    return dtos.map(mapCompraDetalle);
  }

  async consultarProductoPorCodigo(codigo: string): Promise<ProductoEscaneado> {
    try {
      return await firstValueFrom(
        this.http.get<ProductoEscaneado>(
          `${this.catalogoBaseUrl}/producto/consultar-por-codigo-barras/${encodeURIComponent(codigo)}`
        )
      );
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse && err.error?.mensaje) {
        throw new Error(err.error.mensaje as string);
      }
      throw new Error('Error al consultar el producto');
    }
  }

  async guardarCompra(request: GuardarCompraRequest): Promise<void> {
    await firstValueFrom(
      this.http.post(this.baseUrl, request, { observe: 'response' })
    );
  }
}
