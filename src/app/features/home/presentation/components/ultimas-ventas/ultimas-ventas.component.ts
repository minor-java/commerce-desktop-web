import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { UltimaVenta } from '../../../domain/dashboard.model';

@Component({
  selector: 'app-ultimas-ventas',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './ultimas-ventas.component.html',
  styleUrl: './ultimas-ventas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UltimasVentasComponent {
  readonly ventas = input<UltimaVenta[]>([]);
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
}
