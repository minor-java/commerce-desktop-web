export interface GuardarProductoRequest {
  nombre: string;
  presentacionValor?: string;
  presentacionUnidad?: string;
  activo: boolean;
  usuarioId?: number;
  precioVenta?: number;
  areaNegocioId: number;
  /** Tarifa de impuesto propia; null = heredar la del área. */
  tarifaImpuestoId: number | null;
  codigosBarras: string[];
}
