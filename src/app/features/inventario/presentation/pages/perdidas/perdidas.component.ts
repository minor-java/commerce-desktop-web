import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { BuscarProductoDialogComponent } from '../../components/buscar-producto-dialog/buscar-producto-dialog.component';
import { RegistrarPerdidaUseCase } from '../../../application/use-cases/registrar-perdida.use-case';
import { ListarPerdidasUseCase } from '../../../application/use-cases/listar-perdidas.use-case';
import { PerdidaItem } from '../../../domain/perdida.model';
import { ProductoEscaneado } from '../../../domain/compra.model';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';

@Component({
  selector: 'app-perdidas',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, PaginationComponent, BuscarProductoDialogComponent],
  templateUrl: './perdidas.component.html',
  styleUrl: './perdidas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerdidasComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly registrarUseCase = inject(RegistrarPerdidaUseCase);
  private readonly listarUseCase = inject(ListarPerdidasUseCase);

  readonly dialogAbierto = signal(false);
  readonly productoSeleccionado = signal<ProductoEscaneado | null>(null);
  readonly guardando = signal(false);

  readonly items = signal<PerdidaItem[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);

  readonly form = new FormGroup({
    cantidad: new FormControl<number | null>(null, [Validators.required, Validators.min(0.001)]),
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirDialog(): void {
    this.dialogAbierto.set(true);
  }

  onProductoSeleccionado(producto: ProductoEscaneado): void {
    this.productoSeleccionado.set(producto);
    this.dialogAbierto.set(false);
    this.form.controls.cantidad.reset();
  }

  onDialogCerrado(): void {
    this.dialogAbierto.set(false);
  }

  limpiarProducto(): void {
    this.productoSeleccionado.set(null);
    this.form.reset();
  }

  async registrar(): Promise<void> {
    this.form.markAllAsTouched();
    const producto = this.productoSeleccionado();
    if (!producto || this.form.invalid) return;

    const usuarioId = this.auth.session()?.usuarioId;
    if (!usuarioId) return;

    this.guardando.set(true);
    try {
      await this.registrarUseCase.execute({
        productoId: producto.productoId,
        cantidad: this.form.controls.cantidad.value!,
        usuarioId,
      });
      this.toast.show('Pérdida registrada correctamente', 'success');
      this.productoSeleccionado.set(null);
      this.form.reset();
      this.page.set(0);
      await this.cargar();
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'Error al registrar la pérdida'), 'error');
    } finally {
      this.guardando.set(false);
    }
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const res = await this.listarUseCase.execute({ page: this.page(), size: this.size() });
      this.items.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.toast.show('Error al cargar el historial de pérdidas', 'error');
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarPagina(p: number): void {
    if (p === this.page()) return;
    this.page.set(p);
    this.cargar();
  }

  cambiarTamano(size: number): void {
    this.size.set(size);
    this.page.set(0);
    this.cargar();
  }
}
