export interface HistorialCajaItem {
  id: number;
  montoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  montoCierreReal: number | null;
  diferencia: number | null;
  fechaApertura: string;
  fechaCierre: string | null;
  usuarioId: number;
  usuario: string;
  estado: 'ABIERTA' | 'CERRADA';
}

export interface HistorialCajaPaginadoRequest {
  page: number;
  size: number;
  estado?: 'ABIERTA' | 'CERRADA';
  usuarioId?: number;
  fechaAperturaDesde?: string;
  fechaAperturaHasta?: string;
}

export interface HistorialCajaPaginadoResponse {
  contenido: HistorialCajaItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}
