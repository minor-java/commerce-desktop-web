import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { DetalleNuevaCompra, ProductoEscaneado } from '../../../domain/compra.model';
import { ConsultarProductoPorCodigoUseCase } from '../../../application/use-cases/consultar-producto-por-codigo.use-case';
import { GuardarCompraUseCase } from '../../../application/use-cases/guardar-compra.use-case';
import { BuscarProductoDialogComponent } from '../../components/buscar-producto-dialog/buscar-producto-dialog.component';

@Component({
  selector: 'app-nueva-compra',
  imports: [ReactiveFormsModule, DecimalPipe, BuscarProductoDialogComponent],
  templateUrl: './nueva-compra.component.html',
  styleUrl: './nueva-compra.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaCompraComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly consultarProducto = inject(ConsultarProductoPorCodigoUseCase);
  private readonly guardarCompraUseCase = inject(GuardarCompraUseCase);

  private readonly productoInputEl = viewChild.required<ElementRef<HTMLInputElement>>('productoInput');
  private readonly cantidadInputEl = viewChild<ElementRef<HTMLInputElement>>('cantidadInput');
  private readonly costoUnitarioInputEl = viewChild<ElementRef<HTMLInputElement>>('costoUnitarioInput');
  private readonly agregarBtnEl = viewChild<ElementRef<HTMLButtonElement>>('agregarBtn');

  readonly headerForm = this.fb.group({
    proveedor: [''],
    observacion: [''],
  });

  readonly detalleForm = this.fb.group({
    cantidad: [null as number | null, [Validators.required, Validators.min(0.001)]],
    costoUnitario: [null as number | null, [Validators.required, Validators.min(0.001)]],
  });

  readonly productoActual = signal<ProductoEscaneado | null>(null);
  readonly detalles = signal<DetalleNuevaCompra[]>([]);
  readonly errorEscaneo = signal<string | null>(null);
  readonly infoEscaneo = signal<string | null>(null);
  readonly buscandoProducto = signal(false);
  readonly guardando = signal(false);
  readonly errorGuardar = signal<string | null>(null);

  readonly dialogBuscarAbierto = signal(false);
  readonly modalProductoAbierto = signal(false);
  readonly modalGuardarAbierto = signal(false);
  readonly modalCancelarAbierto = signal(false);
  readonly costoUnitarioDisplay = signal('');

  readonly totalCosto = computed(() =>
    this.detalles().reduce((acc, d) => acc + d.cantidad * d.costoUnitario, 0)
  );

  private uid = 0;

  ngAfterViewInit(): void {
    this.productoInputEl().nativeElement.focus();
  }

  async onCodigoEscaneado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const codigo = input.value.trim();
    input.value = '';

    if (!codigo) return;

    this.errorEscaneo.set(null);
    this.infoEscaneo.set(null);
    this.buscandoProducto.set(true);

    try {
      const producto = await this.consultarProducto.execute(codigo);

      const yaExiste = this.detalles().some(d => d.productoId === producto.productoId);
      if (yaExiste) {
        this.infoEscaneo.set(`"${producto.nombreCompleto}" ya está en el listado y no puede agregarse de nuevo.`);
        return;
      }

      this.productoActual.set(producto);
      this.detalleForm.reset();
      this.costoUnitarioDisplay.set('');
      this.modalProductoAbierto.set(true);
      setTimeout(() => this.cantidadInputEl()?.nativeElement.focus(), 50);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar el producto';
      this.errorEscaneo.set(msg);
    } finally {
      this.buscandoProducto.set(false);
      if (!this.modalProductoAbierto()) {
        setTimeout(() => this.productoInputEl().nativeElement.focus(), 50);
      }
    }
  }

  limpiarMensajesEscaneo(): void {
    this.errorEscaneo.set(null);
    this.infoEscaneo.set(null);
  }

  abrirDialogBuscar(): void {
    this.dialogBuscarAbierto.set(true);
  }

  cerrarDialogBuscar(): void {
    this.dialogBuscarAbierto.set(false);
    setTimeout(() => this.productoInputEl().nativeElement.focus(), 50);
  }

  onProductoSeleccionadoDesdeDialog(producto: ProductoEscaneado): void {
    this.cerrarDialogBuscar();

    const yaExiste = this.detalles().some(d => d.productoId === producto.productoId);
    if (yaExiste) {
      this.infoEscaneo.set(`"${producto.nombreCompleto}" ya está en el listado y no puede agregarse de nuevo.`);
      return;
    }

    this.errorEscaneo.set(null);
    this.infoEscaneo.set(null);
    this.productoActual.set(producto);
    this.detalleForm.reset();
    this.costoUnitarioDisplay.set('');
    this.modalProductoAbierto.set(true);
    setTimeout(() => this.cantidadInputEl()?.nativeElement.focus(), 50);
  }

  actualizarCostoUnitario(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.costoUnitarioDisplay.set(formatted);
    input.value = formatted;
    this.detalleForm.controls.costoUnitario.setValue(raw === '' ? null : Number(raw));
  }

  onCantidadKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.costoUnitarioInputEl()?.nativeElement.focus();
    }
  }

  onCostoUnitarioKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.agregarBtnEl()?.nativeElement.focus();
    }
  }

  cerrarModalProducto(): void {
    this.modalProductoAbierto.set(false);
    this.productoActual.set(null);
    this.detalleForm.reset();
    this.costoUnitarioDisplay.set('');
    setTimeout(() => this.productoInputEl().nativeElement.focus(), 50);
  }

  agregarDetalle(): void {
    this.detalleForm.markAllAsTouched();
    if (this.detalleForm.invalid || !this.productoActual()) return;

    const producto = this.productoActual()!;
    const { cantidad, costoUnitario } = this.detalleForm.value;

    this.detalles.update(d => [
      ...d,
      {
        uid: ++this.uid,
        productoId: producto.productoId,
        nombreCompleto: producto.nombreCompleto,
        precioVenta: producto.precioVenta,
        cantidad: cantidad!,
        costoUnitario: costoUnitario!,
      },
    ]);

    this.cerrarModalProducto();
  }

  eliminarDetalle(uid: number): void {
    this.detalles.update(d => d.filter(det => det.uid !== uid));
  }

  abrirConfirmarGuardar(): void {
    if (this.detalles().length === 0) {
      this.errorGuardar.set('Debe agregar al menos un producto al detalle de la compra.');
      return;
    }
    this.errorGuardar.set(null);
    this.modalGuardarAbierto.set(true);
  }

  async confirmarGuardar(): Promise<void> {
    this.modalGuardarAbierto.set(false);
    this.guardando.set(true);
    this.errorGuardar.set(null);

    const { proveedor, observacion } = this.headerForm.value;

    try {
      await this.guardarCompraUseCase.execute({
        ...(proveedor?.trim() ? { proveedor: proveedor.trim() } : {}),
        ...(observacion?.trim() ? { observacion: observacion.trim() } : {}),
        detalles: this.detalles().map(d => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          costoUnitario: d.costoUnitario,
        })),
      });
      this.router.navigate(['/inventario/compra']);
    } catch {
      this.errorGuardar.set('Error al guardar la compra. Verifique la conexión con el servidor.');
    } finally {
      this.guardando.set(false);
    }
  }

  abrirConfirmarCancelar(): void {
    this.modalCancelarAbierto.set(true);
  }

  confirmarCancelar(): void {
    this.modalCancelarAbierto.set(false);
    this.headerForm.reset();
    this.detalles.set([]);
    this.errorEscaneo.set(null);
    this.infoEscaneo.set(null);
    this.errorGuardar.set(null);
    setTimeout(() => this.productoInputEl().nativeElement.focus(), 50);
  }
}
