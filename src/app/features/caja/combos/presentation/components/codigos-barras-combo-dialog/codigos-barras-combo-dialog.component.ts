import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Combo } from '../../../domain/combo.model';
import { CodigosBarrasPrintListComponent } from '../codigos-barras-print-list/codigos-barras-print-list.component';

@Component({
  selector: 'app-codigos-barras-combo-dialog',
  templateUrl: './codigos-barras-combo-dialog.component.html',
  styleUrl: './codigos-barras-combo-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodigosBarrasPrintListComponent],
})
export class CodigosBarrasComboDialogComponent {
  readonly combo = input.required<Combo>();
  readonly cerrado = output<void>();

  onCerrar(): void {
    this.cerrado.emit();
  }
}
