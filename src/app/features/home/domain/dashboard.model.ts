export interface TopProducto {
  productoId: number | null;
  comboId: number | null;
  nombre: string;
  cantidadVendida: number;
  totalVendido: number;
}

export interface UltimaVenta {
  id: number;
  total: number;
  fechaCreacion: string;
  cantidadItems: number;
}

/** Fila del detalle por área. areaNegocioId null = productos sin área asignada. */
export interface ResumenArea {
  areaNegocioId: number | null;
  nombre: string;
  activa: boolean;
  totalVendidoHoy: number;
  totalReversosHoy: number;
  totalVendidoMes: number;
  /** Ventas distintas que incluyeron el área (una venta mixta cuenta en cada área). */
  cantidadVentasMes: number;
  totalImpuestoMes: number;
}
