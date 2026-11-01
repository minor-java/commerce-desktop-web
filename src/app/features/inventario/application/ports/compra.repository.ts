import { CompraPaginadoRequest, CompraPaginadoResponse, CompraDetalle, ProductoEscaneado, GuardarCompraRequest } from '../../domain/compra.model';

export interface CompraRepository {
  listarPaginado(request: CompraPaginadoRequest): Promise<CompraPaginadoResponse>;
  consultarDetalle(compraId: number): Promise<CompraDetalle[]>;
  consultarProductoPorCodigo(codigo: string): Promise<ProductoEscaneado>;
  guardarCompra(request: GuardarCompraRequest): Promise<void>;
}
