import { CodigoBarra } from "../../domain/codigo-barra.model";
import { Producto } from "../../domain/producto.model";
import { CodigoBarraDto } from "../dto/codigo-barra.dto";
import { ProductoDto } from "../dto/producto.dto";

export function mapProducto(dto: ProductoDto): Producto {
  return {
    id: dto.id,
    nombre: dto.nombre,

    presentacion: mapPresentacion(dto),

    codigoBarra: dto.codigosBarra.map(mapCodigoBarra),

    precioVenta: dto.precioVenta,
    activo: dto.activo,

    creadoEn: new Date(dto.creadoEn),
    actualizadoEn: new Date(dto.actualizadoEn),

    creadoPor: dto.creadoPor,
    actualizadoPor: dto.actualizadoPor
  };
}

function mapPresentacion(dto: ProductoDto) {
  if (!dto.presentacionValor || !dto.presentacionUnidad) {
    return undefined;
  }

  return {
    valor: dto.presentacionValor,
    unidad: dto.presentacionUnidad
  };
}

function mapCodigoBarra(dto: CodigoBarraDto): CodigoBarra {
  return {
    id: dto.id,
    codigo: dto.codigo,
    tipo: dto.tipo,
    principal: dto.principal,
    creadoEn: new Date(dto.creadoEn),
    creadoPor: dto.creadoPor,
    actualizadoPor: dto.actualizadoPor
  };
}