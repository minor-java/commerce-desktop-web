export type TipoImpuesto = 'IVA' | 'INC';
export type ClasificacionImpuesto = 'GRAVADO' | 'EXENTO' | 'EXCLUIDO';

export interface TarifaImpuesto {
  id: number;
  nombre: string;
  tipo: TipoImpuesto;
  clasificacion: ClasificacionImpuesto;
  porcentaje: number;
  activo: boolean;
  porDefecto: boolean;
}

/** GET /impuestos/vigentes: lo que necesitan los formularios con selector de tarifa. */
export interface ImpuestosVigentes {
  responsableIva: boolean;
  tarifaPorDefectoId: number | null;
  /** Solo activas (las que se pueden asignar). */
  tarifas: TarifaImpuesto[];
}

/** GET /parametros-venta. */
export interface ParametrosVenta {
  /** 0 = sin redondeo, 1 = al peso, 50, 100, 500 o 1000. */
  redondeoTotal: number;
  venderSinStock: boolean;
  /** % máximo de descuento al bajar el precio (null = sin límite). */
  descuentoMaximo: number | null;
  receptorObligatorio: boolean;
  pagoEfectivo: boolean;
  pagoTransferencia: boolean;
  responsableIva: boolean;
  fechaActualizacion?: string | null;
  usuarioActualizacion?: string | null;
}

export const PARAMETROS_VENTA_POR_DEFECTO: ParametrosVenta = {
  redondeoTotal: 0,
  venderSinStock: false,
  descuentoMaximo: null,
  receptorObligatorio: false,
  pagoEfectivo: true,
  pagoTransferencia: true,
  responsableIva: false,
};

/** Redondea el total igual que el backend (CalculadoraImpuestos.redondearTotal, HALF_UP). */
export function redondearTotal(total: number, multiplo: number): number {
  if (multiplo <= 0) return total;
  return Math.round(total / multiplo + Number.EPSILON) * multiplo;
}
