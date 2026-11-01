export interface ProductoStock {
  productoId?: number;
  comboId?: number;
  nombreCompleto: string;
  precioVenta: number;
  stock: number;
}

export interface ItemVenta {
  productoId?: number;
  comboId?: number;
  nombreCompleto: string;
  precioVenta: number;
  precioPersonalizado?: number;
  stock: number;
  cantidad: number;
}

export interface RegistrarVentaRequest {
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
  detalles: { productoId?: number; comboId?: number; cantidad: number; precioUnitario?: number }[];
  receptorNombre?: string;
}

export interface VentaDetalle {
  id: number;
  productoId: number;
  ventaId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface LineaTicket {
  tipo: string;
  texto?: string;
  alineacion?: string;
  negrita?: boolean;
  tamano?: string;
  cantidad?: number;
  base64?: string;
}

export interface VentaResponse {
  id: number;
  total: number;
  fechaCreacion: string;
  usuarioId: number;
  receptorNombre?: string;
  metodoPago?: string;
  detalles: VentaDetalle[];
  ticket?: LineaTicket[];
}
