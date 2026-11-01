import { DiaLog } from '../../domain/log.model';

export interface LogRepository {
  listar(): Promise<DiaLog[]>;
  /** Texto plano del día (servidor + app de escritorio). */
  descargarDia(fecha: string): Promise<Blob>;
  /** .zip con todos los días e info.txt del equipo. */
  descargarTodos(): Promise<Blob>;
}
