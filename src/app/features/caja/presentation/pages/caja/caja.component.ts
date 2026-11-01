import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Caja } from '../../../domain/caja.model';
import { ConsultarCajaUseCase } from '../../../application/use-cases/consultar-caja.use-case';
import { AbrirCajaUseCase } from '../../../application/use-cases/abrir-caja.use-case';
import { CerrarCajaUseCase } from '../../../application/use-cases/cerrar-caja.use-case';
import { ModalService } from '../../../../../shared/components/modal/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';

@Component({
  selector: 'app-caja',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaComponent implements OnInit {
  private readonly consultarUseCase = inject(ConsultarCajaUseCase);
  private readonly abrirUseCase = inject(AbrirCajaUseCase);
  private readonly cerrarUseCase = inject(CerrarCajaUseCase);
  private readonly modalService = inject(ModalService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly cajaActiva = signal<Caja | null>(null);
  readonly cargando = signal(true);

  /** Sin estos permisos el backend no envía los valores; aquí solo se adapta la vista. */
  readonly puedeVerTotales = computed(() => this.auth.permisos().has(PERMISOS.CAJA_VER_TOTALES));
  readonly puedeVerResumenCierre = computed(() => this.auth.permisos().has(PERMISOS.CAJA_VER_RESUMEN_CIERRE));

  readonly valorEsperado = computed(() => {
    const caja = this.cajaActiva();
    if (!caja || caja.totalIngresos === null || caja.totalEgresos === null) return null;
    return caja.montoInicial + caja.totalIngresos - caja.totalEgresos;
  });
  readonly abriendo = signal(false);
  readonly cerrando = signal(false);
  readonly montoInicialDisplay = signal('');
  readonly montoCierreDisplay = signal('');

  private readonly montoCierreInputRef = viewChild<ElementRef<HTMLInputElement>>('montoCierreInput');
  private readonly montoInicialInputRef = viewChild<ElementRef<HTMLInputElement>>('montoInicialInput');

  private readonly _focusMontoCierre = effect(() => {
    const el = this.montoCierreInputRef();
    if (el) el.nativeElement.focus();
  });
  private readonly _focusMontoInicial = effect(() => {
    const el = this.montoInicialInputRef();
    if (el) el.nativeElement.focus();
  });

  readonly abrirForm = new FormGroup({
    montoInicial: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  readonly cerrarForm = new FormGroup({
    montoCierreReal: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  ngOnInit(): void {
    this.consultar();
  }

  async consultar(): Promise<void> {
    this.cargando.set(true);
    try {
      const caja = await this.consultarUseCase.execute();
      this.cajaActiva.set(caja);
    } finally {
      this.cargando.set(false);
    }
  }

  async abrir(): Promise<void> {
    this.abrirForm.markAllAsTouched();
    if (this.abrirForm.invalid || this.abriendo()) return;

    const montoInicial = this.abrirForm.controls.montoInicial.value!;
    this.abriendo.set(true);
    try {
      await this.abrirUseCase.execute({ montoInicial });
      this.toast.show('Caja abierta exitosamente', 'success');
      this.abrirForm.reset();
      this.montoInicialDisplay.set('');
      await this.consultar();
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al abrir la caja. Intente nuevamente.'), 'error');
    } finally {
      this.abriendo.set(false);
    }
  }

  async cerrar(): Promise<void> {
    this.cerrarForm.markAllAsTouched();
    if (this.cerrarForm.invalid || this.cerrando()) return;

    const montoCierreReal = this.cerrarForm.controls.montoCierreReal.value!;
    this.cerrando.set(true);
    try {
      const resultado = await this.cerrarUseCase.execute({ montoCierreReal });
      // Sin el permiso (o si el backend no envió el cuadre) solo se confirma el cierre.
      const mostrarResumen = this.puedeVerResumenCierre() && resultado.saldoEsperado !== null;
      await this.modalService.openInfo(mostrarResumen ? {
        titulo: 'Resumen de Cierre de Caja',
        filas: [
          { etiqueta: 'Estado',                  valor: 'Cerrada' },
          { etiqueta: 'Fecha apertura',           valor: this.formatFecha(resultado.fechaApertura) },
          { etiqueta: 'Fecha cierre',             valor: this.formatFecha(resultado.fechaCierre) },
          { etiqueta: 'Monto inicial',            valor: this.formatDinero(resultado.montoInicial) },
          { etiqueta: 'Ingresos efectivo',        valor: this.formatDinero(resultado.totalIngresos) },
          { etiqueta: 'Ingresos transferencia',   valor: this.formatDinero(resultado.totalIngresosTransferencia) },
          { etiqueta: 'Total egresos',            valor: this.formatDinero(resultado.totalEgresos) },
          { etiqueta: 'Saldo esperado en caja',   valor: this.formatDinero(resultado.saldoEsperado) },
          { etiqueta: 'Monto cierre real',        valor: this.formatDinero(resultado.montoCierreReal) },
          { etiqueta: 'Diferencia',               valor: this.formatDinero(resultado.diferencia) },
        ],
      } : {
        titulo: 'Caja cerrada',
        filas: [
          { etiqueta: 'Estado',            valor: 'Cerrada' },
          { etiqueta: 'Fecha apertura',    valor: this.formatFecha(resultado.fechaApertura) },
          { etiqueta: 'Fecha cierre',      valor: this.formatFecha(resultado.fechaCierre) },
          { etiqueta: 'Monto declarado',   valor: this.formatDinero(resultado.montoCierreReal) },
        ],
      });
      this.cerrarForm.reset();
      this.montoCierreDisplay.set('');
      this.montoInicialDisplay.set('');
      await this.consultar();
    } catch (error) {
      this.toast.show(extraerMensajeError(error, 'Error al cerrar la caja. Intente nuevamente.'), 'error');
    } finally {
      this.cerrando.set(false);
    }
  }

  actualizarMontoInicial(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.montoInicialDisplay.set(formatted);
    input.value = formatted;
    this.abrirForm.controls.montoInicial.setValue(raw === '' ? null : Number(raw));
  }

  actualizarMontoCierre(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.montoCierreDisplay.set(formatted);
    input.value = formatted;
    this.cerrarForm.controls.montoCierreReal.setValue(raw === '' ? null : Number(raw));
  }

  soloNumeros(event: KeyboardEvent): void {
    const teclaPermitida = [
      'Backspace', 'Delete', 'Tab', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End',
    ];
    const esDigito = event.key >= '0' && event.key <= '9';
    const esAtajo = event.ctrlKey || event.metaKey;
    if (!esDigito && !teclaPermitida.includes(event.key) && !esAtajo) {
      event.preventDefault();
    }
  }

  private formatFecha(iso: string | null): string {
    if (!iso) return '—';
    const s = iso.substring(0, 16);
    const [fecha, hora] = s.split('T');
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}${hora ? ' ' + hora : ''}`;
  }

  private formatDinero(valor: number | null | undefined): string {
    if (valor == null) return '—';
    return `$ ${valor.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`;
  }
}
