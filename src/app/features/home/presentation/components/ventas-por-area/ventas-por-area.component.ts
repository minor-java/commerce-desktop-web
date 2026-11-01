import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { ResumenArea } from '../../../domain/dashboard.model';

/** Filas visibles antes de "Ver todas": suficiente para la mayoría de negocios sin empujar el resto del dashboard. */
const FILAS_COLAPSADO = 5;

/**
 * Detalle de ventas por área de negocio en una sola tabla (una fila por área) en lugar de
 * una fila de tarjetas por área: escala a muchas áreas sin ocupar toda la pantalla.
 * Con una sola área no se muestra, porque repetiría los indicadores globales.
 */
@Component({
  selector: 'app-ventas-por-area',
  imports: [DecimalPipe, PercentPipe],
  templateUrl: './ventas-por-area.component.html',
  styleUrl: './ventas-por-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentasPorAreaComponent {
  readonly areas = input<ResumenArea[]>([]);
  readonly cargando = input(false);
  readonly error = input<string | null>(null);

  protected readonly expandido = signal(false);

  protected readonly visible = computed(() => this.cargando() || !!this.error() || this.areas().length > 1);

  protected readonly totalMes = computed(() =>
    this.areas().reduce((acc, a) => acc + (a.totalVendidoMes ?? 0), 0),
  );

  /** La columna de impuestos solo aparece si alguna área los generó (negocio responsable). */
  protected readonly mostrarImpuestos = computed(() => this.areas().some(a => (a.totalImpuestoMes ?? 0) > 0));

  protected readonly hayOcultas = computed(() => this.areas().length > FILAS_COLAPSADO);

  protected readonly filas = computed(() => {
    const total = this.totalMes();
    const lista = this.expandido() ? this.areas() : this.areas().slice(0, FILAS_COLAPSADO);
    return lista.map(area => ({
      area,
      participacion: total > 0 ? area.totalVendidoMes / total : 0,
    }));
  });

  protected alternarExpandido(): void {
    this.expandido.update(v => !v);
  }
}
