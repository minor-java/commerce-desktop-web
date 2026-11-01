import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ComboRepository } from '../../application/ports/combo.repository';
import { ActualizarComboRequest, Combo, ComboPaginadoRequest, ComboPaginadoResponse, CostoComboResult, CrearComboRequest, GenerarCodigoBarraResponse, ImprimirEtiquetaCodigoBarraResponse } from '../../domain/combo.model';

@Injectable()
export class ComboApi implements ComboRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/combo`;

  async buscarPaginado(request: ComboPaginadoRequest): Promise<ComboPaginadoResponse> {
    try {
      return await firstValueFrom(
        this.http.post<ComboPaginadoResponse>(`${this.baseUrl}/paginado`, request)
      );
    } catch (err) {
      throw this.mapError(err, 'Error al buscar combos');
    }
  }

  async obtenerPorId(id: number): Promise<Combo> {
    try {
      return await firstValueFrom(
        this.http.get<Combo>(`${this.baseUrl}/${id}`)
      );
    } catch (err) {
      throw this.mapError(err, 'Error al obtener el combo');
    }
  }

  async crear(request: CrearComboRequest): Promise<Combo> {
    try {
      return await firstValueFrom(
        this.http.post<Combo>(this.baseUrl, {
          nombre: request.nombre,
          descripcion: request.descripcion,
          precioBase: request.precioBase,
          cantidadDisponible: request.cantidadDisponible,
          activo: request.activo,
          codigosBarras: request.codigosBarras,
          detalles: request.detalles,
          tarifaImpuestoId: request.tarifaImpuestoId ?? null,
        })
      );
    } catch (err) {
      throw this.mapError(err, 'Error al crear el combo');
    }
  }

  async actualizar(id: number, request: ActualizarComboRequest): Promise<Combo> {
    try {
      return await firstValueFrom(
        this.http.put<Combo>(`${this.baseUrl}/${id}`, request)
      );
    } catch (err) {
      throw this.mapError(err, 'Error al actualizar el combo');
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    } catch (err) {
      throw this.mapError(err, 'Error al eliminar el combo');
    }
  }

  async calcularCosto(items: { productoId: number; cantidad: number }[]): Promise<CostoComboResult> {
    try {
      return await firstValueFrom(
        this.http.post<CostoComboResult>(`${this.baseUrl}/calcular-costo`, { items })
      );
    } catch (err) {
      throw this.mapError(err, 'Error al calcular el costo del combo');
    }
  }

  async verificarCodigoExiste(codigo: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ codigo: string; existe: boolean }>(
          `${environment.apiUrl}/catalogo/producto/existe-por-codigo-barras/${encodeURIComponent(codigo)}`
        )
      );
      return res?.existe ?? false;
    } catch {
      return false;
    }
  }

  async consultarStockVendible(productoId: number): Promise<number> {
    const res = await firstValueFrom(
      this.http.get<{ stock: number }>(
        `${environment.apiUrl}/catalogo/producto/stock-vendible/${productoId}`
      )
    );
    return res?.stock ?? 0;
  }

  async generarCodigoBarras(): Promise<GenerarCodigoBarraResponse> {
    try {
      return await firstValueFrom(
        this.http.post<GenerarCodigoBarraResponse>(
          `${environment.apiUrl}/catalogo/codigo-barras/generar`,
          null
        )
      );
    } catch (err) {
      throw this.mapError(err, 'Error al generar el código de barras');
    }
  }

  async imprimirEtiquetaCodigoBarra(codigo: string, nombre: string, cantidad: number): Promise<ImprimirEtiquetaCodigoBarraResponse> {
    try {
      return await firstValueFrom(
        this.http.post<ImprimirEtiquetaCodigoBarraResponse>(`${this.baseUrl}/codigo-barras/imprimir`, { codigo, nombre, cantidad })
      );
    } catch (err) {
      throw this.mapError(err, 'Error al generar la etiqueta de código de barras');
    }
  }

  private mapError(err: unknown, fallback: string): Error {
    if (err instanceof Error) return err;
    if (err instanceof HttpErrorResponse) {
      const mensaje = (err.error as Record<string, unknown>)?.['mensaje'];
      if (typeof mensaje === 'string') return new Error(mensaje);
    }
    return new Error(fallback);
  }
}
