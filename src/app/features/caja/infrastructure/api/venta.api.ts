import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { VentaRepository } from '../../application/ports/venta.repository';
import { environment } from '../../../../../environments/environment';
import { LineaTicket, ProductoStock, RegistrarVentaRequest, VentaResponse } from '../../domain/venta.model';
import { HistorialVentasRequest, HistorialVentasResponse, VentaDevolucion, VentaEnriquecida } from '../../domain/historial-ventas-caja.model';
import { HistorialVentasResponseDto, LineaTicketDto, ProductoStockDto, VentaDevolucionDto, VentaEnriquecidaDto, VentaResponseDto } from '../dto/venta.dto';
import { mapVentaResponse } from '../mappers/venta.mapper';
import { ProductoPaginadoRequest, ProductoPaginadoResponse } from '../../../catalogo/domain/producto-paginado.model';

@Injectable()
export class VentaApi implements VentaRepository {
  private readonly http = inject(HttpClient);
  private readonly catalogoBaseUrl = `${environment.apiUrl}/catalogo`;
  private readonly ventaBaseUrl = `${environment.apiUrl}/venta`;

  async buscarProductoPorCodigo(codigo: string): Promise<ProductoStock> {
    try {
      const dto = await firstValueFrom(
        this.http.get<ProductoStockDto>(
          `${this.catalogoBaseUrl}/producto/stock-por-codigo-barras/${encodeURIComponent(codigo)}`
        )
      );
      if (dto.codigo === 'PRODUCTO_INACTIVO') {
        throw new Error(dto.mensaje ?? 'El producto se encuentra inactivo');
      }
      return {
        productoId: dto.comboId ? undefined : dto.productoId,
        comboId: dto.comboId ?? undefined,
        nombreCompleto: dto.nombreCompleto!,
        precioVenta: dto.precioVenta!,
        stock: dto.stock!,
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      if (err instanceof HttpErrorResponse) {
        const mensaje = (err.error as Record<string, unknown>)?.['mensaje'];
        if (typeof mensaje === 'string') throw new Error(mensaje);
      }
      throw new Error('Error al consultar el producto');
    }
  }

  async listarItemsVenta(request: ProductoPaginadoRequest): Promise<ProductoPaginadoResponse> {
    const dto = await firstValueFrom(
      this.http.post<ProductoPaginadoResponse>(
        `${this.catalogoBaseUrl}/producto/paginado-venta`,
        request
      )
    );
    return dto;
  }

  async registrarVenta(request: RegistrarVentaRequest): Promise<VentaResponse> {
    const dto = await firstValueFrom(
      this.http.post<VentaResponseDto>(this.ventaBaseUrl, request)
    );
    return mapVentaResponse(dto);
  }

  async obtenerDetalleVenta(id: number): Promise<VentaEnriquecida> {
    const dto = await firstValueFrom(
      this.http.get<VentaEnriquecidaDto>(`${this.ventaBaseUrl}/${id}/detalle`)
    );
    return {
      id: dto.id,
      total: dto.total,
      fechaCreacion: dto.fechaCreacion,
      usuarioId: dto.usuarioId,
      detalles: dto.detalles.map(d => ({
        id: d.id,
        productoId: d.productoId,
        comboId: d.comboId,
        ventaId: d.ventaId,
        nombreProducto: d.nombreProducto,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    };
  }

  async reversarVentaDetalle(ventaDetalleId: number, cantidadReversada: number, observacion?: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/reversos/venta`, {
          ventaDetalleId,
          cantidadReversada,
          observacion: observacion ?? null,
        })
      );
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        const mensaje = (err.error as Record<string, unknown>)?.['mensaje'];
        if (typeof mensaje === 'string') throw new Error(mensaje);
      }
      throw new Error('Error al procesar el reverso');
    }
  }

  async listarHistorialVentas(request: HistorialVentasRequest): Promise<HistorialVentasResponse> {
    const dto = await firstValueFrom(
      this.http.post<HistorialVentasResponseDto>(`${this.ventaBaseUrl}/paginado`, request)
    );
    return {
      contenido: dto.contenido.map(v => ({
        id: v.id,
        fechaCreacion: v.fechaCreacion,
        total: v.total,
      })),
      totalRows: dto.totalRows,
      page: dto.page,
      size: dto.size,
      totalPages: dto.totalPages,
    };
  }

  async consultarParaDevolucion(id: number): Promise<VentaDevolucion> {
    try {
      const dto = await firstValueFrom(
        this.http.get<VentaDevolucionDto>(`${this.ventaBaseUrl}/${id}/consultar-devolucion`)
      );
      return {
        id: dto.id,
        total: dto.total,
        fechaCreacion: dto.fechaCreacion,
        usuarioId: dto.usuarioId,
        cajaId: dto.cajaId,
        usuarioCajaOrigen: dto.usuarioCajaOrigen,
        fechaAperturaCaja: dto.fechaAperturaCaja,
        fechaCierreCaja: dto.fechaCierreCaja,
        detalles: dto.detalles.map(d => ({
          id: d.id,
          productoId: d.productoId,
          comboId: d.comboId,
          ventaId: d.ventaId,
          nombreProducto: d.nombreProducto,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        })),
      };
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        const mensaje = (err.error as Record<string, unknown>)?.['mensaje'];
        if (typeof mensaje === 'string') throw new Error(mensaje);
      }
      throw new Error('Error al consultar la venta');
    }
  }

  async obtenerTicket(id: number): Promise<LineaTicket[]> {
    try {
      const lineas = await firstValueFrom(
        this.http.get<LineaTicketDto[]>(`${this.ventaBaseUrl}/${id}/ticket`)
      );
      return lineas;
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        const mensaje = (err.error as Record<string, unknown>)?.['mensaje'];
        if (typeof mensaje === 'string') throw new Error(mensaje);
      }
      throw new Error('Error al obtener el ticket de la venta');
    }
  }
}
