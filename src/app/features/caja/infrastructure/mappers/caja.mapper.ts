import { Caja } from '../../domain/caja.model';
import { CajaDto } from '../dto/caja.dto';

export function mapCaja(dto: CajaDto): Caja {
  return {
    id: dto.id,
    montoInicial: dto.montoInicial,
    totalIngresos: dto.totalIngresos ?? null,
    totalIngresosTransferencia: dto.totalIngresosTransferencia ?? null,
    totalEgresos: dto.totalEgresos ?? null,
    saldoEsperado: dto.saldoEsperado,
    montoCierreReal: dto.montoCierreReal,
    diferencia: dto.diferencia,
    estado: dto.estado as 'ABIERTA' | 'CERRADA',
    fechaApertura: dto.fechaApertura,
    fechaCierre: dto.fechaCierre,
    usuarioId: dto.usuarioId,
  };
}
