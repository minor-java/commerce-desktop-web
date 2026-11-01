import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  imports: [DecimalPipe],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  readonly titulo = input.required<string>();
  readonly valor = input<number | null>(null);
  readonly tipo = input<'money' | 'count'>('count');
  readonly color = input<'blue' | 'green' | 'indigo' | 'orange' | 'rose'>('blue');
  readonly subtitulo = input('');
  readonly cargando = input(false);
}
