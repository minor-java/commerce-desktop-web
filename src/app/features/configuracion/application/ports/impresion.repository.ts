import {
  ConfiguracionImpresion,
  ImpresoraDisponible,
  LineaTicket,
  ResultadoConexion,
  TipoPrueba,
} from '../../domain/impresion.model';

export interface ImpresionRepository {
  obtener(): Promise<ConfiguracionImpresion>;
  guardar(config: ConfiguracionImpresion): Promise<ConfiguracionImpresion>;
  vistaPrevia(config: ConfiguracionImpresion): Promise<LineaTicket[]>;
  listarImpresoras(): Promise<ImpresoraDisponible[]>;
  probarConexion(config: ConfiguracionImpresion): Promise<ResultadoConexion>;
  imprimirPrueba(config: ConfiguracionImpresion, tipo: TipoPrueba): Promise<void>;
}
