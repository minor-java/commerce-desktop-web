import { Inject, Injectable } from "@angular/core";
import { PRODUCTO_REPOSITORY } from "../../ports/producto.repository.token";
import { ProductoRepository } from "../../ports/producto.repository";
import { Producto } from "../../../domain/producto.model";

@Injectable({
  providedIn: 'root'
})
export class BuscarProductosPorNombreUseCase {

  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: ProductoRepository
  ) {}

  async ejecutar(nombre: string): Promise<Producto[]> {
    return this.productoRepository.buscarPorNombre(nombre);
  }
}