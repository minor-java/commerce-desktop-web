export interface MovimientoCajaItem {
  id: number;
  tipo: string;
  metodoPago: string;
  monto: number;
  referenciaTipo: string;
  referenciaId: number | null;
  fechaCreacion: string;
}

export interface VentaDetalleItem {
  id: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number | null;
  subtotal: number;
}

export interface VentaDetalleCaja {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  usuario: string | null;
  detalles: VentaDetalleItem[];
}

export interface ReversoItemDetalle {
  productoId: number;
  nombreProducto: string | null;
  cantidad: number;
  costoUnitario: number | null;
}

export interface ReversoDetalleCaja {
  id: number;
  cantidadReversada: number;
  observacion: string | null;
  fechaCreacion: string;
  usuarioId: number;
  usuario: string | null;
  // Producto individual
  productoId: number | null;
  nombreProducto: string | null;
  cantidad: number | null;
  costoUnitario: number | null;
  precioVenta: number | null;
  // Combo
  comboId: number | null;
  nombreCombo: string | null;
  items: ReversoItemDetalle[] | null;
}
