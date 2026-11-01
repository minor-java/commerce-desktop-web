import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StockResumenItem } from '../../../domain/stock-movimiento.model';

@Component({
  selector: 'app-resumen-stock-cards',
  imports: [DecimalPipe],
  templateUrl: './resumen-stock-cards.component.html',
  styleUrl: './resumen-stock-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenStockCardsComponent {
  readonly titulo = input.required<string>();
  readonly resumen = input<StockResumenItem | null>(null);
}
