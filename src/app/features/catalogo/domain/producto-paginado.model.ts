export interface CodigosBarraPaginado {
  id: number;
  productoId: number;
  codigo: string;
  tipo?: string;
  principal?: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  creadoPor: number;
  actualizadoPor: number | null;
}

export interface ProductoPaginadoItem {
  id: number;
  nombre: string;
  presentacionValor?: number;
  presentacionUnidad?: string;
  precioVenta: number;
  activo: boolean;
  areaNegocioId?: number;
  tarifaImpuestoId?: number | null;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  creadoPor: number;
  actualizadoPor: number | null;
  codigosBarras: CodigosBarraPaginado[];
  stock?: number;
  tipo?: 'PRODUCTO' | 'COMBO';
  comboId?: number;
}

export interface ProductoPaginadoRequest {
  page: number;
  size: number;
  nombre?: string;
  presentacionValor?: number;
  presentacionUnidad?: string;
  activo?: boolean;
  codigoBarra?: string;
  precioVenta?: string;
}

export interface ProductoPaginadoResponse {
  contenido: ProductoPaginadoItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}
