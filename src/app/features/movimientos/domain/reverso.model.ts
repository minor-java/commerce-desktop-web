export interface AplicarReversoRequest {
  movimientoId: number;
}

export interface AplicarReversoResponse {
  id: number;
  movimientoId: number;
  cantidadReversada: number;
  observacion: string | null;
  fechaCreacion: string;
  usuarioId: number;
}
