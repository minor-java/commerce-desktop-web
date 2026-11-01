import { LineaTicket, ProductoStock, RegistrarVentaRequest, VentaResponse } from '../../domain/venta.model';
import { HistorialVentasRequest, HistorialVentasResponse, VentaDevolucion, VentaEnriquecida } from '../../domain/historial-ventas-caja.model';
import { ProductoPaginadoRequest, ProductoPaginadoResponse } from '../../../catalogo/domain/producto-paginado.model';

export interface VentaRepository {
  buscarProductoPorCodigo(codigo: string): Promise<ProductoStock>;
  listarItemsVenta(request: ProductoPaginadoRequest): Promise<ProductoPaginadoResponse>;
  registrarVenta(request: RegistrarVentaRequest): Promise<VentaResponse>;
  listarHistorialVentas(request: HistorialVentasRequest): Promise<HistorialVentasResponse>;
  obtenerDetalleVenta(id: number): Promise<VentaEnriquecida>;
  reversarVentaDetalle(ventaDetalleId: number, cantidadReversada: number, observacion?: string): Promise<void>;
  consultarParaDevolucion(id: number): Promise<VentaDevolucion>;
  obtenerTicket(id: number): Promise<LineaTicket[]>;
}
