import { inject, Injectable } from "@angular/core";
import { ProductoRepository } from "../../../application/ports/producto.repository";
import { Producto } from "../../../domain/producto.model";
import { ProductoPaginadoRequest, ProductoPaginadoResponse } from "../../../domain/producto-paginado.model";
import { GuardarProductoRequest } from "../../../domain/guardar-producto.model";
import { ActualizarProductoRequest, EliminarCodigoBarraRequest, ExisteCodigoBarrasResponse, GuardarCodigosBarraRequest } from "../../../domain/actualizar-producto.model";
import { GenerarCodigoBarraResponse, ImprimirEtiquetaCodigoBarraResponse } from "../../../domain/codigo-barra.model";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductoApi implements ProductoRepository {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = '/api/productos';
  private readonly catalogoBaseUrl = `${environment.apiUrl}/catalogo`;

  async buscarPorCodigo(codigo: string): Promise<Producto | null> {
    if (codigo === '123456') {
      return {
        id: '1',
        nombre: 'Coca Cola 1L',
        presentacion: { valor: 1, unidad: 'lt' },
        codigoBarra: [
          {
            id: 'cb1',
            codigo: '123456',
            tipo: 'EAN13',
            principal: true,
            creadoEn: new Date(),
            creadoPor: 'system'
          }
        ],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        creadoPor: 'system'
      };
    }
    return null;
  }

  async buscarPorNombre(nombre: string): Promise<Producto[]> {
    const productos: Producto[] = [
      {
        id: '1',
        nombre: 'Coca Cola 1L',
        presentacion: { valor: 1, unidad: 'lt' },
        codigoBarra: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        creadoPor: 'system'
      },
      {
        id: '2',
        nombre: 'Coca Cola 500ml',
        presentacion: { valor: 500, unidad: 'ml' },
        codigoBarra: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        creadoPor: 'system'
      }
    ];

    return productos.filter(p =>
      p.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  listarPaginado(request: ProductoPaginadoRequest): Promise<ProductoPaginadoResponse> {
    return firstValueFrom(
      this.http.post<ProductoPaginadoResponse>(
        `${this.catalogoBaseUrl}/producto/paginado`,
        request
      )
    );
  }

  async guardar(request: GuardarProductoRequest): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.catalogoBaseUrl}/producto/guardar`,
        request,
        { observe: 'response' }
      )
    );
  }

  async actualizar(request: ActualizarProductoRequest): Promise<void> {
    await firstValueFrom(
      this.http.put(
        `${this.catalogoBaseUrl}/producto/actualizar`,
        request,
        { observe: 'response' }
      )
    );
  }

  async eliminarCodigosBarras(request: EliminarCodigoBarraRequest): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${this.catalogoBaseUrl}/codigo-barras/eliminar`,
        { body: request, observe: 'response' }
      )
    );
  }

  async guardarCodigosBarras(request: GuardarCodigosBarraRequest): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.catalogoBaseUrl}/codigo-barras/guardar`,
        request,
        { observe: 'response' }
      )
    );
  }

  existePorCodigoBarras(codigo: string): Promise<ExisteCodigoBarrasResponse> {
    return firstValueFrom(
      this.http.get<ExisteCodigoBarrasResponse>(
        `${this.catalogoBaseUrl}/producto/existe-por-codigo-barras/${encodeURIComponent(codigo)}`
      )
    );
  }

  generarCodigoBarras(): Promise<GenerarCodigoBarraResponse> {
    return firstValueFrom(
      this.http.post<GenerarCodigoBarraResponse>(
        `${this.catalogoBaseUrl}/codigo-barras/generar`,
        null
      )
    );
  }

  imprimirEtiquetaCodigoBarra(codigo: string, nombre: string, cantidad: number): Promise<ImprimirEtiquetaCodigoBarraResponse> {
    return firstValueFrom(
      this.http.post<ImprimirEtiquetaCodigoBarraResponse>(
        `${this.catalogoBaseUrl}/producto/codigo-barras/imprimir`,
        { codigo, nombre, cantidad }
      )
    );
  }
}
