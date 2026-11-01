import { StockMovimientoItem, StockResumenItem } from '../../domain/stock-movimiento.model';
import { StockMovimientoDto, StockResumenDto } from '../dto/stock-movimiento.dto';

export function mapStockMovimiento(dto: StockMovimientoDto): StockMovimientoItem {
  return {
    id: dto.id,
    nombre: dto.nombre,
    presentacionValor: dto.presentacionValor,
    presentacionUnidad: dto.presentacionUnidad,
    precioVenta: dto.precioVenta,
    costoPromedio: dto.costoPromedio,
    stock: dto.stock,
    stockCombo: dto.stockCombo ?? 0,
    activo: dto.activo,
    codigoBarra: dto.codigoBarra ?? null,
  };
}

export function mapStockResumen(dto: StockResumenDto): StockResumenItem {
  return {
    totalProductos: dto.totalProductos,
    costoTotalInventario: dto.costoTotalInventario,
    valorVentaTotal: dto.valorVentaTotal,
    margenBrutoTotal: dto.margenBrutoTotal,
    productosSinStock: dto.productosSinStock,
    productosActivos: dto.productosActivos,
    productosInactivos: dto.productosInactivos,
  };
}
