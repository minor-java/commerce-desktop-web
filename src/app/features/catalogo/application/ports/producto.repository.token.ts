import { InjectionToken } from "@angular/core";
import { ProductoRepository } from "./producto.repository";

export const PRODUCTO_REPOSITORY = new InjectionToken<ProductoRepository>(
  'PRODUCTO_REPOSITORY'
);