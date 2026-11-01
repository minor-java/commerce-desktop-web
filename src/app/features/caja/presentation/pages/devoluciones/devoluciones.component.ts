import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ConsultarCajaUseCase } from '../../../application/use-cases/consultar-caja.use-case';
import { ConsultarVentaDevolucionUseCase } from '../../../application/use-cases/consultar-venta-devolucion.use-case';
import { ReversarVentaDetalleUseCase } from '../../../application/use-cases/reversar-venta-detalle.use-case';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Caja } from '../../../domain/caja.model';
import { VentaDetalleEnriquecida, VentaDevolucion } from '../../../domain/historial-ventas-caja.model';

@Component({
  selector: 'app-devoluciones',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './devoluciones.component.html',
  styleUrl: './devoluciones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevolucionesComponent implements OnInit {
  private readonly consultarCaja = inject(ConsultarCajaUseCase);
  private readonly consultarVentaDevolucion = inject(ConsultarVentaDevolucionUseCase);
  private readonly reversarDetalle = inject(ReversarVentaDetalleUseCase);
  private readonly toast = inject(ToastService);

  readonly verificandoCaja = signal(true);
  readonly caja = signal<Caja | null>(null);
  readonly codigoVenta = signal('');
  readonly buscando = signal(false);
  readonly error = signal<string | null>(null);
  readonly venta = signal<VentaDevolucion | null>(null);

  readonly reversandoDetalleId = signal<number | null>(null);
  readonly cantidadReverso = signal('');
  readonly enviandoReverso = signal(false);

  private readonly codigoVentaInputRef = viewChild<ElementRef<HTMLInputElement>>('codigoVentaInput');
  private readonly _focusCodigoVenta = effect(() => {
    const el = this.codigoVentaInputRef();
    if (el) el.nativeElement.focus();
  });

  ngOnInit(): void {
    void this.verificarCaja();
  }

  private async verificarCaja(): Promise<void> {
    this.verificandoCaja.set(true);
    try {
      const cajaActiva = await this.consultarCaja.execute();
      this.caja.set(cajaActiva);
    } catch {
      this.caja.set(null);
    } finally {
      this.verificandoCaja.set(false);
    }
  }

  actualizarCodigo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value === '' || /^\d+$/.test(value)) {
      this.codigoVenta.set(value);
    } else {
      input.value = this.codigoVenta();
    }
  }

  async buscarVenta(): Promise<void> {
    const codigo = this.codigoVenta().trim();
    const idVenta = parseInt(codigo, 10);
    if (!codigo || isNaN(idVenta)) return;

    if (!this.caja()) return;

    this.buscando.set(true);
    this.error.set(null);
    this.venta.set(null);
    this.reversandoDetalleId.set(null);
    this.cantidadReverso.set('');

    try {
      const resultado = await this.consultarVentaDevolucion.execute(idVenta);
      this.venta.set(resultado);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Error al consultar la venta');
    } finally {
      this.buscando.set(false);
    }
  }

  limpiar(): void {
    this.codigoVenta.set('');
    this.venta.set(null);
    this.error.set(null);
    this.reversandoDetalleId.set(null);
    this.cantidadReverso.set('');
  }

  esCombo(detalle: VentaDetalleEnriquecida): boolean {
    return !!detalle.comboId;
  }

  iniciarReverso(detalle: VentaDetalleEnriquecida): void {
    this.reversandoDetalleId.set(detalle.id);
    this.cantidadReverso.set('1');
  }

  cancelarReverso(): void {
    this.reversandoDetalleId.set(null);
    this.cantidadReverso.set('');
  }

  actualizarCantidadReverso(event: Event): void {
    this.cantidadReverso.set((event.target as HTMLInputElement).value);
  }

  async confirmarReverso(detalle: VentaDetalleEnriquecida): Promise<void> {
    const cantidad = parseInt(this.cantidadReverso(), 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      this.toast.show('La cantidad debe ser mayor a 0', 'error');
      return;
    }
    this.enviandoReverso.set(true);
    try {
      await this.reversarDetalle.execute(detalle.id, cantidad);
      this.cancelarReverso();
      this.toast.show('Reverso aplicado correctamente', 'success');
      const idVenta = this.venta()!.id;
      const resultado = await this.consultarVentaDevolucion.execute(idVenta);
      this.venta.set(resultado);
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
