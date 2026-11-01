import { ActualizarComboRequest, Combo, ComboPaginadoRequest, ComboPaginadoResponse, CostoComboResult, CrearComboRequest, GenerarCodigoBarraResponse, ImprimirEtiquetaCodigoBarraResponse } from '../../domain/combo.model';

export interface ComboRepository {
  buscarPaginado(request: ComboPaginadoRequest): Promise<ComboPaginadoResponse>;
  obtenerPorId(id: number): Promise<Combo>;
  crear(request: CrearComboRequest): Promise<Combo>;
  actualizar(id: number, request: ActualizarComboRequest): Promise<Combo>;
  eliminar(id: number): Promise<void>;
  calcularCosto(items: { productoId: number; cantidad: number }[]): Promise<CostoComboResult>;
  verificarCodigoExiste(codigo: string): Promise<boolean>;
  consultarStockVendible(productoId: number): Promise<number>;
  generarCodigoBarras(): Promise<GenerarCodigoBarraResponse>;
  imprimirEtiquetaCodigoBarra(codigo: string, nombre: string, cantidad: number): Promise<ImprimirEtiquetaCodigoBarraResponse>;
}
