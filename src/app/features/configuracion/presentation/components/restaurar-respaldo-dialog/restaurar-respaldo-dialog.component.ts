import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe, KeyValuePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { RestaurarRespaldoUseCase } from '../../../application/use-cases/restaurar-respaldo.use-case';
import { CONFIRMACION_RESTAURAR, formatearTamano, VistaPreviaRespaldo } from '../../../domain/respaldo.model';

@Component({
  selector: 'app-restaurar-respaldo-dialog',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, KeyValuePipe],
  templateUrl: './restaurar-respaldo-dialog.component.html',
  styleUrl: './restaurar-respaldo-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class RestaurarRespaldoDialogComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly restaurarUseCase = inject(RestaurarRespaldoUseCase);

  readonly vista = input.required<VistaPreviaRespaldo>();
  /** Nombre con que el usuario cargó el archivo (solo informativo). */
  readonly nombreOriginal = input<string | null>(null);

  readonly restaurado = output<void>();
  readonly cerrado = output<void>();

  readonly palabraConfirmacion = CONFIRMACION_RESTAURAR;
  readonly contrasena = new FormControl('', { nonNullable: true, validators: Validators.required });
  readonly confirmacion = new FormControl('', { nonNullable: true });
  private readonly confirmacionValor = toSignal(this.confirmacion.valueChanges, { initialValue: '' });

  readonly restaurando = signal(false);
  readonly error = signal<string | null>(null);

  readonly tamano = computed(() => formatearTamano(this.vista().respaldo.tamanoBytes));
  readonly confirmado = computed(() => this.confirmacionValor().trim() === CONFIRMACION_RESTAURAR);
  readonly sinOrdenConteos = () => 0;

  constructor() {
    afterNextRender(() =>
      this.host.nativeElement.querySelector<HTMLElement>('input:not([disabled]), .dialog-close')?.focus()
    );
  }

  async restaurar(): Promise<void> {
    this.contrasena.markAsTouched();
    const v = this.vista();
    if (!v.puedeRestaurar || !this.confirmado() || this.contrasena.invalid || this.restaurando()) return;

    this.restaurando.set(true);
    this.error.set(null);
    try {
      await this.restaurarUseCase.execute({
        cargaId: v.cargaId,
        archivo: v.cargaId ? null : v.respaldo.archivo,
        contrasena: this.contrasena.value,
        confirmacion: this.confirmacion.value.trim(),
      });
      this.restaurado.emit();
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo restaurar el respaldo'));
    } finally {
      this.restaurando.set(false);
    }
  }

  cerrar(): void {
    if (!this.restaurando()) this.cerrado.emit();
  }
}
