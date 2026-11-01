import { ClasificacionImpuesto, TarifaImpuesto, TipoImpuesto } from '../../../core/negocio/negocio.model';

export interface ConfiguracionImpuestos {
  responsableIva: boolean;
  mostrarDesgloseRecibo: boolean;
  leyendaRecibo: string | null;
  fechaActualizacion: string | null;
  usuarioActualizacion: string | null;
}

export type GuardarConfiguracionImpuestos = Pick<
  ConfiguracionImpuestos,
  'responsableIva' | 'mostrarDesgloseRecibo' | 'leyendaRecibo'
>;

/** Tarifa con su uso (listado de Configuración > Impuestos). */
export interface TarifaImpuestoConfig extends TarifaImpuesto {
  cantidadProductos: number;
  cantidadAreas: number;
  cantidadCombos: number;
  usadaEnVentas: boolean;
}

export interface GuardarTarifaImpuesto {
  nombre: string;
  tipo: TipoImpuesto;
  clasificacion: ClasificacionImpuesto;
  porcentaje: number;
  activo: boolean;
  porDefecto: boolean;
}

export const CLASIFICACIONES: { valor: ClasificacionImpuesto; etiqueta: string; ayuda: string }[] = [
  { valor: 'GRAVADO', etiqueta: 'Gravado', ayuda: 'Se cobra el impuesto con el porcentaje indicado' },
  { valor: 'EXENTO', etiqueta: 'Exento', ayuda: 'Gravado a tarifa 0%' },
  { valor: 'EXCLUIDO', etiqueta: 'Excluido', ayuda: 'No causa el impuesto' },
];

export interface FilaReporteImpuestos {
  nombre: string;
  tipo: TipoImpuesto;
  clasificacion: ClasificacionImpuesto;
  porcentaje: number;
  lineasVendidas: number;
  ventasTotal: number;
  ventasBase: number;
  ventasImpuesto: number;
  devolucionesTotal: number;
  devolucionesBase: number;
  devolucionesImpuesto: number;
  netoTotal: number;
  netoBase: number;
  netoImpuesto: number;
}

export interface ReporteImpuestos {
  desde: string;
  hasta: string;
  filas: FilaReporteImpuestos[];
  totales: { tipo: TipoImpuesto; netoBase: number; netoImpuesto: number }[];
  ventasSinDesglose: number;
  ajusteRedondeo: number;
}
