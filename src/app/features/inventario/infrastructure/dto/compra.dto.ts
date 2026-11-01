export interface CompraItemDto {
  id: number;
  proveedor: string | null;
  total: number;
  observacion: string | null;
  fechaCreacion: string;
  usuarioId: number;
  detalles: null;
}

export interface CompraDetalleDto {
  id: number;
  compraId: number;
  producto: { productoId: number; nombre: string };
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface CompraPaginadoResponseDto {
  contenido: CompraItemDto[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}
