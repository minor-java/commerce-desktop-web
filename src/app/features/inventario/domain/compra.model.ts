export interface CompraItem {
  id: number;
  proveedor: string | null;
  total: number;
  observacion: string | null;
  fechaCreacion: string;
  usuarioId: number;
}

export interface CompraDetalle {
  id: number;
  compraId: number;
  producto: { productoId: number; nombre: string };
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface CompraPaginadoRequest {
  page: number;
  size: number;
  proveedor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: number;
}

export interface CompraPaginadoResponse {
  contenido: CompraItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ProductoEscaneado {
  productoId: number;
  nombreCompleto: string;
  precioVenta: number;
}

export interface DetalleNuevaCompra {
  uid: number;
  productoId: number;
  nombreCompleto: string;
  precioVenta: number;
  cantidad: number;
  costoUnitario: number;
}

export interface GuardarCompraRequest {
  proveedor?: string;
  observacion?: string;
  detalles: { productoId: number; cantidad: number; costoUnitario: number }[];
}
