import { CompraDetalle, CompraItem } from '../../domain/compra.model';
import { CompraDetalleDto, CompraItemDto } from '../dto/compra.dto';

export function mapCompraItem(dto: CompraItemDto): CompraItem {
  return {
    id: dto.id,
    proveedor: dto.proveedor,
    total: dto.total,
    observacion: dto.observacion,
    fechaCreacion: dto.fechaCreacion,
    usuarioId: dto.usuarioId,
  };
}

export function mapCompraDetalle(dto: CompraDetalleDto): CompraDetalle {
  return {
    id: dto.id,
    compraId: dto.compraId,
    producto: { productoId: dto.producto.productoId, nombre: dto.producto.nombre },
    cantidad: dto.cantidad,
    costoUnitario: dto.costoUnitario,
    subtotal: dto.subtotal,
  };
}
