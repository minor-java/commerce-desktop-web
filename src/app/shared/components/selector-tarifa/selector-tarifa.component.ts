import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ImpuestosVigentes } from '../../../core/negocio/negocio.model';

/**
 * Selector de tarifa de impuesto de un producto o combo. La opción vacía (null)
 * significa "heredar" (del área, o la por defecto) y muestra cuál se aplicaría.
 * Solo se muestra si el negocio es responsable de IVA.
 */
@Component({
  selector: 'app-selector-tarifa',
  imports: [ReactiveFormsModule],
  templateUrl: './selector-tarifa.component.html',
  styleUrl: './selector-tarifa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorTarifaComponent {
  readonly control = input.required<FormControl<number | null>>();
  readonly impuestos = input<ImpuestosVigentes | null>(null);
  /** Tarifa que se heredaría (la del área); null = la por defecto; undefined = no se conoce (no se muestra). */
  readonly tarifaHeredadaId = input<number | null | undefined>(null);
  /** Texto de la opción heredada, p. ej. "Según el área". */
  readonly etiquetaHeredada = input('Según el área');
  readonly inputId = input('tarifa-impuesto');

  readonly visible = computed(() => this.impuestos()?.responsableIva === true);

  readonly nombreHeredada = computed(() => {
    const imp = this.impuestos();
    const heredada = this.tarifaHeredadaId();
    if (!imp || heredada === undefined) return '';
    const id = heredada ?? imp.tarifaPorDefectoId;
    return imp.tarifas.find(t => t.id === id)?.nombre ?? '';
  });

  readonly textoHeredada = computed(() => {
    const nombre = this.nombreHeredada();
    return nombre ? `${this.etiquetaHeredada()} (${nombre})` : this.etiquetaHeredada();
  });
}
