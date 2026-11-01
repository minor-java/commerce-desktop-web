import { Respaldo, RestaurarRespaldo, VistaPreviaRespaldo } from '../../domain/respaldo.model';

export interface RespaldoRepository {
  listar(): Promise<Respaldo[]>;
  generar(): Promise<Respaldo>;
  descargar(archivo: string): Promise<Blob>;
  vistaPrevia(archivo: string): Promise<VistaPreviaRespaldo>;
  cargar(archivo: File): Promise<VistaPreviaRespaldo>;
  restaurar(request: RestaurarRespaldo): Promise<void>;
}
