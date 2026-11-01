import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ConfigurarImpuestosUseCase } from '../../../application/use-cases/configurar-impuestos.use-case';
import { CLASIFICACIONES, ConfiguracionImpuestos, TarifaImpuestoConfig } from '../../../domain/impuesto.model';
import { ClasificacionImpuesto, TipoImpuesto } from '../../../../../core/negocio/negocio.model';

@Component({
  selector: 'app-impuestos',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './impuestos.component.html',
  styleUrl: './impuestos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrarDialogos()' },
})
export class ImpuestosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly useCase = inject(ConfigurarImpuestosUseCase);

  private readonly nombreInput = viewChild<ElementRef<HTMLInputElement>>('nombreInput');

  readonly clasificaciones = CLASIFICACIONES;

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  // ---- Régimen ----
  readonly configuracion = signal<ConfiguracionImpuestos | null>(null);
  readonly guardandoConfig = signal(false);
  readonly configForm = this.fb.nonNullable.group({
    responsableIva: [false],
    mostrarDesgloseRecibo: [true],
    leyendaRecibo: ['', [Validators.maxLength(100)]],
  });
  private readonly configValores = signal(this.configForm.getRawValue());
  readonly responsable = computed(() => this.configValores().responsableIva);
  readonly configSinGuardar = computed(() => {
    const c = this.configuracion();
    const v = this.configValores();
    if (!c) return false;
    return (
      c.responsableIva !== v.responsableIva ||
      c.mostrarDesgloseRecibo !== v.mostrarDesgloseRecibo ||
      (c.leyendaRecibo ?? '') !== v.leyendaRecibo.trim()
    );
  });

  // ---- Tarifas ----
  readonly tarifas = signal<TarifaImpuestoConfig[]>([]);
  /** undefined = cerrado, null = nueva tarifa. */
  readonly tarifaEnEdicion = signal<TarifaImpuestoConfig | null | undefined>(undefined);
  readonly guardandoTarifa = signal(false);
  readonly errorTarifa = signal<string | null>(null);
  readonly tarifaAEliminar = signal<TarifaImpuestoConfig | null>(null);
  readonly eliminando = signal(false);

  readonly tarifaForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    tipo: ['IVA' as TipoImpuesto],
    clasificacion: ['GRAVADO' as ClasificacionImpuesto],
    porcentaje: [19, [Validators.min(0), Validators.max(99.99)]],
    activo: [true],
    porDefecto: [false],
  });
  private readonly tarifaValores = signal(this.tarifaForm.getRawValue());
  readonly esGravada = computed(() => this.tarifaValores().clasificacion === 'GRAVADO');
  readonly esInc = computed(() => this.tarifaValores().tipo === 'INC');
  readonly ayudaClasificacion = computed(() => {
    const c = CLASIFICACIONES.find(x => x.valor === this.tarifaValores().clasificacion);
    return c ? `${c.etiqueta}: ${c.ayuda.charAt(0).toLowerCase()}${c.ayuda.slice(1)}` : '';
  });

  constructor() {
    this.configForm.valueChanges.subscribe(() => this.configValores.set(this.configForm.getRawValue()));
    this.tarifaForm.valueChanges.subscribe(() => this.tarifaValores.set(this.tarifaForm.getRawValue()));
    // Exentas y excluidas son 0%; el INC solo puede ser gravado.
    this.tarifaForm.controls.clasificacion.valueChanges.subscribe(c => {
      if (c !== 'GRAVADO') this.tarifaForm.controls.porcentaje.setValue(0, { emitEvent: false });
    });
    this.tarifaForm.controls.tipo.valueChanges.subscribe(t => {
      if (t === 'INC') this.tarifaForm.controls.clasificacion.setValue('GRAVADO');
    });
  }

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [config, tarifas] = await Promise.all([
        this.useCase.obtenerConfiguracion(),
        this.useCase.listarTarifas(),
      ]);
      this.aplicarConfiguracion(config);
      this.tarifas.set(tarifas);
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo cargar la configuración de impuestos'));
    } finally {
      this.cargando.set(false);
    }
  }

  private aplicarConfiguracion(config: ConfiguracionImpuestos): void {
    this.configuracion.set(config);
    this.configForm.reset({
      responsableIva: config.responsableIva,
      mostrarDesgloseRecibo: config.mostrarDesgloseRecibo,
      leyendaRecibo: config.leyendaRecibo ?? '',
    });
    this.configValores.set(this.configForm.getRawValue());
  }

  descartarConfiguracion(): void {
    const c = this.configuracion();
    if (c) this.aplicarConfiguracion(c);
  }

  async guardarConfiguracion(): Promise<void> {
    if (this.configForm.invalid || this.guardandoConfig()) return;
    const v = this.configForm.getRawValue();
    this.guardandoConfig.set(true);
    try {
      const guardada = await this.useCase.guardarConfiguracion({
        responsableIva: v.responsableIva,
        mostrarDesgloseRecibo: v.mostrarDesgloseRecibo,
        leyendaRecibo: v.leyendaRecibo.trim() || null,
      });
      this.aplicarConfiguracion(guardada);
      this.toast.show('Configuración de impuestos guardada', 'success');
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo guardar la configuración'), 'error');
    } finally {
      this.guardandoConfig.set(false);
    }
  }

  // ---- Tarifas ----

  nuevaTarifa(): void {
    this.abrirTarifa(null);
  }

  editarTarifa(t: TarifaImpuestoConfig): void {
    this.abrirTarifa(t);
  }

  private abrirTarifa(t: TarifaImpuestoConfig | null): void {
    this.tarifaForm.reset(
      {
        nombre: t?.nombre ?? '',
        tipo: t?.tipo ?? 'IVA',
        clasificacion: t?.clasificacion ?? 'GRAVADO',
        porcentaje: t?.porcentaje ?? 19,
        activo: t?.activo ?? true,
        porDefecto: t?.porDefecto ?? false,
      },
      { emitEvent: false }
    );
    this.tarifaValores.set(this.tarifaForm.getRawValue());
    this.errorTarifa.set(null);
    this.tarifaEnEdicion.set(t);
    setTimeout(() => this.nombreInput()?.nativeElement.focus());
  }

  mostrarErrorNombre(): boolean {
    const c = this.tarifaForm.controls.nombre;
    return c.invalid && c.touched;
  }

  async guardarTarifa(): Promise<void> {
    this.tarifaForm.markAllAsTouched();
    const t = this.tarifaEnEdicion();
    if (this.tarifaForm.invalid || this.guardandoTarifa() || t === undefined) return;
    const v = this.tarifaForm.getRawValue();
    this.guardandoTarifa.set(true);
    this.errorTarifa.set(null);
    try {
      await this.useCase.guardarTarifa(t?.id ?? null, {
        nombre: v.nombre.trim(),
        tipo: v.tipo,
        clasificacion: v.clasificacion,
        porcentaje: v.clasificacion === 'GRAVADO' ? Number(v.porcentaje) : 0,
        activo: v.activo,
        porDefecto: v.porDefecto,
      });
      // Recarga: marcar una tarifa por defecto desmarca la anterior.
      this.tarifas.set(await this.useCase.listarTarifas());
      this.toast.show(`Tarifa ${v.nombre.trim()} ${t ? 'actualizada' : 'creada'}`, 'success');
      this.tarifaEnEdicion.set(undefined);
    } catch (err) {
      this.errorTarifa.set(extraerMensajeError(err, 'No se pudo guardar la tarifa'));
    } finally {
      this.guardandoTarifa.set(false);
    }
  }

  puedeEliminar(t: TarifaImpuestoConfig): boolean {
    return !t.porDefecto && !t.usadaEnVentas && t.cantidadProductos + t.cantidadAreas + t.cantidadCombos === 0;
  }

  motivoNoEliminar(t: TarifaImpuestoConfig): string | null {
    if (t.porDefecto) return 'Es la tarifa por defecto';
    if (!this.puedeEliminar(t)) return 'Ya se usó: desactívela en lugar de eliminarla';
    return null;
  }

  usoTexto(t: TarifaImpuestoConfig): string {
    const partes: string[] = [];
    if (t.cantidadProductos) partes.push(`${t.cantidadProductos} producto(s)`);
    if (t.cantidadAreas) partes.push(`${t.cantidadAreas} área(s)`);
    if (t.cantidadCombos) partes.push(`${t.cantidadCombos} combo(s)`);
    return partes.length ? partes.join(', ') : '—';
  }

  etiquetaClasificacion(c: ClasificacionImpuesto): string {
    return CLASIFICACIONES.find(x => x.valor === c)?.etiqueta ?? c;
  }

  confirmarEliminar(t: TarifaImpuestoConfig): void {
    this.tarifaAEliminar.set(t);
  }

  async eliminar(): Promise<void> {
    const t = this.tarifaAEliminar();
    if (!t) return;
    this.eliminando.set(true);
    try {
      await this.useCase.eliminarTarifa(t.id);
      this.tarifas.update(lista => lista.filter(x => x.id !== t.id));
      this.toast.show(`Tarifa ${t.nombre} eliminada`, 'success');
      this.tarifaAEliminar.set(null);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo eliminar la tarifa'), 'error');
    } finally {
      this.eliminando.set(false);
    }
  }

  cerrarDialogos(): void {
    if (!this.guardandoTarifa()) this.tarifaEnEdicion.set(undefined);
    if (!this.eliminando()) this.tarifaAEliminar.set(null);
  }
}
