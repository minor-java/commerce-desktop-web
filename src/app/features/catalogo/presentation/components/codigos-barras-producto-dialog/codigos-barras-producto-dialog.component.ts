import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CodigosBarrasPrintListComponent } from '../codigos-barras-print-list/codigos-barras-print-list.component';

@Component({
  selector: 'app-codigos-barras-producto-dialog',
  templateUrl: './codigos-barras-producto-dialog.component.html',
  styleUrl: './codigos-barras-producto-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodigosBarrasPrintListComponent],
})
export class CodigosBarrasProductoDialogComponent {
  readonly titulo = input.required<string>();
  readonly codigos = input.required<string[]>();
  readonly cerrado = output<void>();

  onCerrar(): void {
    this.cerrado.emit();
  }
}
