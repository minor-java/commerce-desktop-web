export interface AreaNegocioConfig {
  id: number;
  nombre: string;
  activo: boolean;
  cantidadProductos: number;
  /** Tarifa que heredan sus productos; null = la por defecto. */
  tarifaImpuestoId: number | null;
}

export interface GuardarAreaNegocio {
  nombre: string;
  activo: boolean;
  tarifaImpuestoId: number | null;
}
