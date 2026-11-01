export interface CajaDto {
  id: number;
  montoInicial: number;
  totalIngresos: number | null;
  totalIngresosTransferencia: number | null;
  totalEgresos: number | null;
  saldoEsperado: number | null;
  montoCierreReal: number | null;
  diferencia: number | null;
  estado: string;
  fechaApertura: string;
  fechaCierre: string | null;
  usuarioId: number;
}
