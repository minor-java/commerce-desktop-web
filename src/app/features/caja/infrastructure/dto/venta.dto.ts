export interface ProductoStockDto {
  productoId?: number;
  comboId?: number;
  nombreCompleto?: string;
  precioVenta?: number;
  stock?: number;
  codigo?: string;
  mensaje?: string;
  timestamp?: string;
}

export interface VentaDetalleDto {
  id: number;
  productoId: number;
  ventaId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface LineaTicketDto {
  tipo: string;
  texto?: string;
  alineacion?: string;
  negrita?: boolean;
  tamano?: string;
  cantidad?: number;
  base64?: string;
}

export interface VentaResponseDto {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  receptorNombre?: string;
  metodoPago?: string;
  detalles: VentaDetalleDto[];
  ticket?: LineaTicketDto[];
}

export interface VentaPaginadaItemDto {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
}

export interface HistorialVentasResponseDto {
  contenido: VentaPaginadaItemDto[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface VentaDetalleEnriquecidaDto {
  id: number;
  productoId: number;
  comboId?: number;
  ventaId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaEnriquecidaDto {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  detalles: VentaDetalleEnriquecidaDto[];
}

export interface VentaDevolucionDto {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  cajaId: number;
  usuarioCajaOrigen?: string;
  fechaAperturaCaja?: string;
  fechaCierreCaja?: string;
  detalles: VentaDetalleEnriquecidaDto[];
}
