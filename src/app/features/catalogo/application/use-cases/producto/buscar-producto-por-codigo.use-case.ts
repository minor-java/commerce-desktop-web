import { Inject, Injectable } from "@angular/core";
import { Producto } from "../../../domain/producto.model";
import { ProductoRepository } from "../../ports/producto.repository";
import { PRODUCTO_REPOSITORY } from "../../ports/producto.repository.token";

@Injectable({
  providedIn: 'root'
})
export class BuscarProductoPorCodigoUseCase {

  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: ProductoRepository
  ) {}

  async ejecutar(codigo: string): Promise<Producto | null> {
    
    this.validarCodigo(codigo);

    const producto = await this.productoRepository.buscarPorCodigo(codigo);

    return producto;
  }

  private validarCodigo(codigo: string): void {
    
    if (!codigo || codigo.trim().length === 0) {
      throw new Error('El código es requerido');
    }

    // Opcional: reglas futuras
    // if (codigo.length < 8) {
    //   throw new Error('Código inválido');
    // }
  }
}