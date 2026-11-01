export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'REVERSO';

export interface ProductoResumen {
  productoId: number;
  nombre: string;
}

export interface MovimientoItem {
  id: number;
  productoId: number;
  comboId: number | null;
  producto: ProductoResumen;
  tipo: TipoMovimiento;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  referenciaTipo: string;
  referenciaId: number;
  fechaCreacion: string;
  usurioId: number;
  movimientoOrigenId: number | null;
}

export interface MovimientoPaginadoRequest {
  page: number;
  size: number;
  referenciaTipo?: string;
  productoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface MovimientoPaginadoResponse {
  contenido: MovimientoItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}
