import { LineaTicket } from '../../domain/venta.model';

export interface ComboDetalle {
  id: number;
  comboId: number;
  productoId: number;
  cantidad: number;
}

export interface Combo {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioBase: number;
  activo: boolean;
  cantidadDisponible: number;
  fechaCreacion: string;
  usuarioId: number;
  detalles: ComboDetalle[];
  codigosBarras: string[];
  tarifaImpuestoId?: number | null;
}

export interface ComboPaginadoRequest {
  page: number;
  size: number;
  nombre?: string;
  activo?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ComboPaginadoResponse {
  contenido: Combo[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ItemCombo {
  productoId: number;
  nombreCompleto: string;
  stock: number;
  cantidad: number;
}

export interface CostoComboItem {
  productoId: number;
  nombreProducto: string;
  costoUnitario: number;
  cantidad: number;
  costoItem: number;
}

export interface CostoComboResult {
  costoTotal: number;
  items: CostoComboItem[];
}

export interface ActualizarComboRequest {
  nombre?: string;
  descripcion?: string | null;
  precioBase?: number;
  activo?: boolean;
  cantidadDisponible?: number;
  codigosBarras?: string[];
  /** null/ausente = no cambiar, 0 = heredar la del área, otro = esa tarifa. */
  tarifaImpuestoId?: number;
}

export interface CrearComboRequest {
  nombre: string;
  descripcion: string | null;
  precioBase: number;
  cantidadDisponible: number;
  activo: boolean;
  codigosBarras: string[];
  tarifaImpuestoId?: number | null;
  detalles: { productoId: number; cantidad: number }[];
}

export interface GenerarCodigoBarraResponse {
  codigo: string;
  tipo: string;
}

export interface ImprimirEtiquetaCodigoBarraResponse {
  lineas: LineaTicket[];
}
