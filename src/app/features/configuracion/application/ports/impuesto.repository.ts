import { ParametrosVenta } from '../../../../core/negocio/negocio.model';
import {
  ConfiguracionImpuestos,
  GuardarConfiguracionImpuestos,
  GuardarTarifaImpuesto,
  ReporteImpuestos,
  TarifaImpuestoConfig,
} from '../../domain/impuesto.model';

export interface ImpuestoRepository {
  obtenerConfiguracion(): Promise<ConfiguracionImpuestos>;
  guardarConfiguracion(request: GuardarConfiguracionImpuestos): Promise<ConfiguracionImpuestos>;
  listarTarifas(): Promise<TarifaImpuestoConfig[]>;
  crearTarifa(request: GuardarTarifaImpuesto): Promise<TarifaImpuestoConfig>;
  actualizarTarifa(id: number, request: GuardarTarifaImpuesto): Promise<TarifaImpuestoConfig>;
  eliminarTarifa(id: number): Promise<void>;
  reporte(desde: string, hasta: string): Promise<ReporteImpuestos>;
  obtenerParametrosVenta(): Promise<ParametrosVenta>;
  guardarParametrosVenta(request: ParametrosVenta): Promise<ParametrosVenta>;
}
