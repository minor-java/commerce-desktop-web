export interface StockMovimientoItem {
  id: number;
  nombre: string | null;
  presentacionValor: number | null;
  presentacionUnidad: string | null;
  precioVenta: number | null;
  costoPromedio: number | null;
  stock: number;
  stockCombo: number;
  activo: boolean;
  codigoBarra: string | null;
}

export interface StockMovimientoPaginadoRequest {
  page: number;
  size: number;
  nombre?: string;
  presentacionValor?: number;
  presentacionUnidad?: string;
  activo?: boolean;
  precioVenta?: number;
  codigoBarra?: string;
}

export interface StockMovimientoPaginadoResponse {
  contenido: StockMovimientoItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface StockResumenItem {
  totalProductos: number;
  costoTotalInventario: number;
  valorVentaTotal: number;
  margenBrutoTotal: number;
  productosSinStock: number;
  productosActivos: number;
  productosInactivos: number;
}
