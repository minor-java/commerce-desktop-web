import { CodigoBarraDto } from "./codigo-barra.dto";

export interface ProductoDto {
  id: string;

  nombre: string;

  presentacionValor?: number;
  presentacionUnidad?: string;

  precioVenta?: number;

  activo: boolean;

  creadoEn: string;
  actualizadoEn: string;

  creadoPor: string;
  actualizadoPor?: string;

  codigosBarra: CodigoBarraDto[];
}