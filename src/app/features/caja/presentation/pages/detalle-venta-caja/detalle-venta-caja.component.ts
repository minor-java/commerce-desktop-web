import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ObtenerDetalleVentaUseCase } from '../../../application/use-cases/obtener-detalle-venta.use-case';
import { ReversarVentaDetalleUseCase } from '../../../application/use-cases/reversar-venta-detalle.use-case';
import { ToastService } from '../../../../../shared/services/toast.service';
import { VentaDetalleEnriquecida, VentaEnriquecida } from '../../../domain/historial-ventas-caja.model';

@Component({
  selector: 'app-detalle-venta-caja',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './detalle-venta-caja.component.html',
  styleUrl: './detalle-venta-caja.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleVentaCajaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly obtenerDetalle = inject(ObtenerDetalleVentaUseCase);
  private readonly reversarDetalle = inject(ReversarVentaDetalleUseCase);
  private readonly toast = inject(ToastService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly venta = signal<VentaEnriquecida | null>(null);

  readonly reversandoDetalleId = signal<number | null>(null);
  readonly cantidadReverso = signal('');
  readonly enviandoReverso = signal(false);
  readonly maxCantidadReverso = signal(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  private async cargar(id: number): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.venta.set(await this.obtenerDetalle.execute(id));
    } catch {
      this.error.set('Error al cargar el detalle de la venta.');
    } finally {
      this.cargando.set(false);
    }
  }

  esCombo(detalle: VentaDetalleEnriquecida): boolean {
    return !!detalle.comboId;
  }

  iniciarReverso(detalle: VentaDetalleEnriquecida): void {
    this.reversandoDetalleId.set(detalle.id);
    this.maxCantidadReverso.set(detalle.cantidad);
    this.cantidadReverso.set('1');
  }

  cancelarReverso(): void {
    this.reversandoDetalleId.set(null);
    this.cantidadReverso.set('');
    this.maxCantidadReverso.set(0);
  }

  actualizarCantidadReverso(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > this.maxCantidadReverso()) {
      this.toast.show(`La cantidad no puede superar ${this.maxCantidadReverso()}`, 'error');
    }
    this.cantidadReverso.set(val);
  }

  soloNumeros(event: KeyboardEvent): void {
    const teclaPermitida = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End',
    ];
    const esDigito = event.key >= '0' && event.key <= '9';
    const esAtajo = event.ctrlKey || event.metaKey;
    if (!esDigito && !teclaPermitida.includes(event.key) && !esAtajo) {
      event.preventDefault();
    }
  }

  async confirmarReverso(detalle: VentaDetalleEnriquecida): Promise<void> {
    const cantidad = parseInt(this.cantidadReverso(), 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      this.toast.show('La cantidad debe ser mayor a 0', 'error');
      return;
    }
    if (cantidad > detalle.cantidad) {
      this.toast.show(`La cantidad no puede superar ${detalle.cantidad}`, 'error');
      return;
    }
    this.enviandoReverso.set(true);
    try {
      await this.reversarDetalle.execute(detalle.id, cantidad);
      this.cancelarReverso();
      this.toast.show('Reverso aplicado correctamente', 'success');
      void this.cargar(this.venta()!.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al procesar el reverso';
      this.toast.show(msg, 'error');
    } finally {
      this.enviandoReverso.set(false);
    }
  }

  formatearFecha(fechaIso: string): string {
    const d = new Date(fechaIso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
