export interface RegistrarPerdidaRequest {
  productoId: number;
  cantidad: number;
  usuarioId: number;
}

export interface PerdidaItem {
  id: number;
  productoId: number;
  nombreProducto: string | null;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  fechaCreacion: string;
}

export interface PerdidaPaginadoRequest {
  page: number;
  size: number;
}

export interface PerdidaPaginadoResponse {
  contenido: PerdidaItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}
