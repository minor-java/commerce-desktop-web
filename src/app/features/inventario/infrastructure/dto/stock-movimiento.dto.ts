export interface StockMovimientoDto {
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

export interface StockResumenDto {
  totalProductos: number;
  costoTotalInventario: number;
  valorVentaTotal: number;
  margenBrutoTotal: number;
  productosSinStock: number;
  productosActivos: number;
  productosInactivos: number;
}
