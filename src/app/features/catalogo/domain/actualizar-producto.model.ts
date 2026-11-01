export interface ActualizarProductoRequest {
  id: number;
  nombre: string;
  presentacionValor?: string;
  presentacionUnidad?: string;
  activo: boolean;
  precioVenta?: number;
  areaNegocioId: number;
  /** Tarifa de impuesto propia; null = heredar la del área. */
  tarifaImpuestoId: number | null;
}

export interface EliminarCodigoBarraRequest {
  ids: number[];
}

export interface GuardarCodigosBarraRequest {
  productoId: number;
  codigos: string[];
}

export interface ExisteCodigoBarrasResponse {
  codigoBarra: string;
  existe: boolean;
}
