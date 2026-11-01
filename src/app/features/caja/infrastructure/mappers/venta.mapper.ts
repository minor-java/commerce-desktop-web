import { VentaResponse } from '../../domain/venta.model';
import { VentaResponseDto } from '../dto/venta.dto';

export function mapVentaResponse(dto: VentaResponseDto): VentaResponse {
  return {
    id: dto.id,
    total: dto.total,
    fechaCreacion: dto.fechaCreacion,
    usuarioId: dto.usuarioId,
    receptorNombre: dto.receptorNombre,
    metodoPago: dto.metodoPago,
    detalles: dto.detalles.map(d => ({
      id: d.id,
      productoId: d.productoId,
      ventaId: d.ventaId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.subtotal,
    })),
    ticket: dto.ticket,
  };
}
