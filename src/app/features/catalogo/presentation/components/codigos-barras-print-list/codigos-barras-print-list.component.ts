import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ImprimirEtiquetaCodigoBarrasUseCase } from '../../../application/use-cases/producto/imprimir-etiqueta-codigo-barras.use-case';
import { PrintService } from '../../../../../shared/services/print.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';

const CANTIDAD_MIN = 1;
const CANTIDAD_MAX = 50;

@Component({
  selector: 'app-codigos-barras-print-list',
  templateUrl: './codigos-barras-print-list.component.html',
  styleUrl: './codigos-barras-print-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodigosBarrasPrintListComponent {
  private readonly imprimirUseCase = inject(ImprimirEtiquetaCodigoBarrasUseCase);
  private readonly printService = inject(PrintService);
  private readonly toast = inject(ToastService);

  readonly codigos = input.required<string[]>();
  readonly nombre = input.required<string>();
  readonly eliminable = input<boolean>(false);
  readonly eliminar = output<number>();

  readonly cantidades = signal<Record<string, number>>({});
  readonly imprimiendo = signal<string | null>(null);

  cantidadDe(codigo: string): number {
    return this.cantidades()[codigo] ?? CANTIDAD_MIN;
  }

  onCantidadInput(codigo: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < CANTIDAD_MIN) value = CANTIDAD_MIN;
    if (value > CANTIDAD_MAX) value = CANTIDAD_MAX;
    input.value = String(value);
    this.cantidades.update(map => ({ ...map, [codigo]: value }));
  }

  async imprimir(codigo: string): Promise<void> {
    if (this.imprimiendo()) return;
    this.imprimiendo.set(codigo);
    try {
      const { lineas } = await this.imprimirUseCase.execute(codigo, this.nombre(), this.cantidadDe(codigo));
      await this.printService.imprimirTicket(lineas);
      this.toast.show(`Etiquetas de "${codigo}" enviadas a imprimir`, 'success');
    } catch (err: unknown) {
      this.toast.show(extraerMensajeError(err, 'Error al imprimir la etiqueta'), 'error');
    } finally {
      this.imprimiendo.set(null);
    }
  }
}
