export interface CajaPaginadaItem {
  id: number;
  montoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoEsperado: number;
  montoCierreReal: number | null;
  diferencia: number | null;
  estado: 'ABIERTA' | 'CERRADA';
  fechaApertura: string;
  fechaCierre: string | null;
  usuarioId: number;
  usuario: string;
  conDiferencia: boolean;
}

export interface CajaPaginadaRequest {
  page: number;
  size: number;
  conDiferencia?: boolean;
  estado?: 'ABIERTA' | 'CERRADA';
  usuarioId?: number;
  fechaAperturaDesde?: string;
  fechaAperturaHasta?: string;
  fechaCierreDesde?: string;
  fechaCierreHasta?: string;
}

export interface CajaPaginadaResponse {
  contenido: CajaPaginadaItem[];
  totalRows: number;
  page: number;
  size: number;
  totalPages: number;
}
