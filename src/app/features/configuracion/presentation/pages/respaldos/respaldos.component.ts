import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PERMISOS } from '../../../../../core/auth/permisos';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ListarRespaldosUseCase } from '../../../application/use-cases/listar-respaldos.use-case';
import { GenerarRespaldoUseCase } from '../../../application/use-cases/generar-respaldo.use-case';
import { DescargarRespaldoUseCase } from '../../../application/use-cases/descargar-respaldo.use-case';
import { VistaPreviaRespaldoUseCase } from '../../../application/use-cases/vista-previa-respaldo.use-case';
import { CargarRespaldoUseCase } from '../../../application/use-cases/cargar-respaldo.use-case';
import { EXTENSION_RESPALDO, formatearTamano, Respaldo, VistaPreviaRespaldo } from '../../../domain/respaldo.model';
import { RestaurarRespaldoDialogComponent } from '../../components/restaurar-respaldo-dialog/restaurar-respaldo-dialog.component';

@Component({
  selector: 'app-respaldos',
  imports: [DatePipe, RestaurarRespaldoDialogComponent],
  templateUrl: './respaldos.component.html',
  styleUrl: './respaldos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RespaldosComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly listarUseCase = inject(ListarRespaldosUseCase);
  private readonly generarUseCase = inject(GenerarRespaldoUseCase);
  private readonly descargarUseCase = inject(DescargarRespaldoUseCase);
  private readonly vistaPreviaUseCase = inject(VistaPreviaRespaldoUseCase);
  private readonly cargarUseCase = inject(CargarRespaldoUseCase);

  readonly extension = EXTENSION_RESPALDO;
  readonly puedeCrear = computed(() => this.auth.permisos().has(PERMISOS.RESPALDO_CREAR));
  /** Restaurar uno de los respaldos de la lista (guardados en este equipo). */
  readonly puedeRestaurar = computed(() => this.auth.permisos().has(PERMISOS.RESPALDO_RESTAURAR));
  /** Seleccionar un archivo externo y restaurarlo. */
  readonly puedeCargar = computed(() => this.auth.permisos().has(PERMISOS.RESPALDO_CARGAR));

  readonly respaldos = signal<Respaldo[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly generando = signal(false);
  readonly subiendo = signal(false);
  readonly procesando = signal<string | null>(null);

  readonly vistaPrevia = signal<VistaPreviaRespaldo | null>(null);
  readonly nombreCargado = signal<string | null>(null);
  readonly restauracionCompletada = signal(false);

  readonly ultimo = computed(() => this.respaldos()[0] ?? null);

  ngOnInit(): void {
    this.cargar();
  }

  tamano(r: Respaldo): string {
    return formatearTamano(r.tamanoBytes);
  }

  resumenConteos(r: Respaldo): string {
    return Object.entries(r.conteos ?? {})
      .map(([k, v]) => `${v} ${k.toLowerCase()}`)
      .join(' · ');
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.respaldos.set(await this.listarUseCase.execute());
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudo cargar el historial de respaldos'));
    } finally {
      this.cargando.set(false);
    }
  }

  async generar(): Promise<void> {
    if (this.generando()) return;
    this.generando.set(true);
    try {
      const respaldo = await this.generarUseCase.execute();
      this.respaldos.update(lista => [respaldo, ...lista.filter(r => r.archivo !== respaldo.archivo)]);
      this.toast.show('Respaldo generado. Elija dónde guardarlo.', 'success');
      await this.descargar(respaldo);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo generar el respaldo'), 'error');
    } finally {
      this.generando.set(false);
    }
  }

  /** La app de escritorio muestra el diálogo "Guardar como" para la descarga. */
  async descargar(respaldo: Respaldo): Promise<void> {
    this.procesando.set(respaldo.archivo);
    try {
      const blob = await this.descargarUseCase.execute(respaldo.archivo);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = respaldo.archivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo descargar el respaldo'), 'error');
    } finally {
      this.procesando.set(null);
    }
  }

  async restaurarDelHistorial(respaldo: Respaldo): Promise<void> {
    this.procesando.set(respaldo.archivo);
    try {
      this.nombreCargado.set(null);
      this.vistaPrevia.set(await this.vistaPreviaUseCase.execute(respaldo.archivo));
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo leer el respaldo'), 'error');
    } finally {
      this.procesando.set(null);
    }
  }

  async archivoSeleccionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    if (!archivo.name.toLowerCase().endsWith(EXTENSION_RESPALDO)) {
      this.toast.show(`Seleccione un archivo ${EXTENSION_RESPALDO}`, 'error');
      return;
    }
    this.subiendo.set(true);
    try {
      this.nombreCargado.set(archivo.name);
      this.vistaPrevia.set(await this.cargarUseCase.execute(archivo));
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo leer el archivo'), 'error');
    } finally {
      this.subiendo.set(false);
    }
  }

  cerrarRestauracion(): void {
    this.vistaPrevia.set(null);
  }

  onRestaurado(): void {
    this.vistaPrevia.set(null);
    this.restauracionCompletada.set(true);
  }

  /** Tras restaurar, el backend invalida todas las sesiones: hay que volver a ingresar. */
  irAlLogin(): void {
    this.auth.logout();
  }
}
