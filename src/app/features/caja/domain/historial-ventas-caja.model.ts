export interface HistorialVentaItem {
  id: number;
  fechaCreacion: string;
  total: number;
}

export interface VentaDetalleEnriquecida {
  id: number;
  productoId: number;
  comboId?: number;
  ventaId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaEnriquecida {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  detalles: VentaDetalleEnriquecida[];
}

export interface HistorialVentasRequest {
  page: number;
  size: number;
  cajaId: number;
  id?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  total?: number;
}

export interface HistorialVentasResponse {
  contenido: HistorialVentaItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface VentaDevolucion {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  cajaId: number;
  usuarioCajaOrigen?: string;
  fechaAperturaCaja?: string;
  fechaCierreCaja?: string;
  detalles: VentaDetalleEnriquecida[];
}
