import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TopProducto } from '../../../domain/dashboard.model';

@Component({
  selector: 'app-top-productos',
  imports: [DecimalPipe],
  templateUrl: './top-productos.component.html',
  styleUrl: './top-productos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopProductosComponent {
  readonly productos = input<TopProducto[]>([]);
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
}
