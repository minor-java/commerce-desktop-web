import { CodigoBarra } from "./codigo-barra.model";
import { Presentacion } from "./presentacion.model";

export interface Producto {
  id: string;

  nombre: string;

  presentacion?: Presentacion;

  precioVenta?: number;

  activo: boolean;

  creadoEn: Date;
  actualizadoEn: Date;

  creadoPor: string;
  actualizadoPor?: string;

  codigoBarra: CodigoBarra[];
}