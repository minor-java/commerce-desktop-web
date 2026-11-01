import { Producto } from "../../domain/producto.model";
import { ProductoPaginadoRequest, ProductoPaginadoResponse } from "../../domain/producto-paginado.model";
import { GuardarProductoRequest } from "../../domain/guardar-producto.model";
import { ActualizarProductoRequest, EliminarCodigoBarraRequest, ExisteCodigoBarrasResponse, GuardarCodigosBarraRequest } from "../../domain/actualizar-producto.model";
import { GenerarCodigoBarraResponse, ImprimirEtiquetaCodigoBarraResponse } from "../../domain/codigo-barra.model";

export interface ProductoRepository {
  buscarPorCodigo(codigo: string): Promise<Producto | null>;
  buscarPorNombre(nombre: string): Promise<Producto[]>;
  listarPaginado(request: ProductoPaginadoRequest): Promise<ProductoPaginadoResponse>;
  guardar(request: GuardarProductoRequest): Promise<void>;
  actualizar(request: ActualizarProductoRequest): Promise<void>;
  eliminarCodigosBarras(request: EliminarCodigoBarraRequest): Promise<void>;
  guardarCodigosBarras(request: GuardarCodigosBarraRequest): Promise<void>;
  existePorCodigoBarras(codigo: string): Promise<ExisteCodigoBarrasResponse>;
  generarCodigoBarras(): Promise<GenerarCodigoBarraResponse>;
  imprimirEtiquetaCodigoBarra(codigo: string, nombre: string, cantidad: number): Promise<ImprimirEtiquetaCodigoBarraResponse>;
}