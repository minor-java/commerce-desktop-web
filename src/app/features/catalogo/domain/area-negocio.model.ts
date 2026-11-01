export interface AreaNegocio {
  id: number;
  nombre: string;
  activo: boolean;
  /** Tarifa que heredan sus productos; null = la por defecto. */
  tarifaImpuestoId?: number | null;
}
