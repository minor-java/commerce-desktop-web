import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Combo, CostoComboResult } from '../../../domain/combo.model';
import { CodigosBarrasPrintListComponent } from '../codigos-barras-print-list/codigos-barras-print-list.component';

@Component({
  selector: 'app-detalle-combo-dialog',
  templateUrl: './detalle-combo-dialog.component.html',
  styleUrl: './detalle-combo-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CodigosBarrasPrintListComponent],
})
export class DetalleComboDialogComponent {
  readonly combo = input.required<Combo>();
  readonly cargando = input<boolean>(false);
  readonly costo = input<CostoComboResult | null>(null);
  readonly cerrado = output<void>();

  readonly costoByProductoId = computed(() => {
    const c = this.costo();
    if (!c) return new Map<number, { unitario: number; total: number; nombre: string }>();
    return new Map(c.items.map(i => [i.productoId, { unitario: i.costoUnitario, total: i.costoItem, nombre: i.nombreProducto }]));
  });

  onCerrar(): void {
    this.cerrado.emit();
  }

  formatearFecha(iso: string): string {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
}
