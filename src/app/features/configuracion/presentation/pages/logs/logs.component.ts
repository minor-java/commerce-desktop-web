import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ListarLogsUseCase } from '../../../application/use-cases/listar-logs.use-case';
import { DescargarLogDiaUseCase } from '../../../application/use-cases/descargar-log-dia.use-case';
import { DescargarLogsUseCase } from '../../../application/use-cases/descargar-logs.use-case';
import { DiaLog, DIAS_RETENCION_LOGS } from '../../../domain/log.model';
import { formatearTamano } from '../../../domain/respaldo.model';

interface FilaLog {
  dia: DiaLog;
  /** Fecha local: 'AAAA-MM-DD' parseado como UTC mostraría el día anterior en Colombia. */
  fecha: Date;
  etiqueta: string | null;
}

@Component({
  selector: 'app-logs',
  imports: [DatePipe],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly listarUseCase = inject(ListarLogsUseCase);
  private readonly descargarDiaUseCase = inject(DescargarLogDiaUseCase);
  private readonly descargarTodosUseCase = inject(DescargarLogsUseCase);

  readonly diasRetencion = DIAS_RETENCION_LOGS;
  readonly dias = signal<DiaLog[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  /** Fecha que se está descargando, o 'todos'. */
  readonly descargando = signal<string | null>(null);

  readonly filas = computed<FilaLog[]>(() => {
    const hoy = claveLocal(new Date());
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const claveAyer = claveLocal(ayer);
    return this.dias().map(dia => ({
      dia,
      fecha: fechaLocal(dia.fecha),
      etiqueta: dia.fecha === hoy ? 'Hoy' : dia.fecha === claveAyer ? 'Ayer' : null,
    }));
  });

  readonly tamanoTotal = computed(() => formatearTamano(this.dias().reduce((t, d) => t + d.tamanoBytes, 0)));

  ngOnInit(): void {
    this.cargar();
  }

  tamano(dia: DiaLog): string {
    return formatearTamano(dia.tamanoBytes);
  }

  origen(dia: DiaLog): string {
    if (dia.servidor && dia.escritorio) return 'Servidor y aplicación';
    return dia.servidor ? 'Servidor' : 'Aplicación';
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.dias.set(await this.listarUseCase.execute());
    } catch (err) {
      this.error.set(extraerMensajeError(err, 'No se pudieron cargar los logs'));
    } finally {
      this.cargando.set(false);
    }
  }

  async descargarDia(dia: DiaLog): Promise<void> {
    if (this.descargando()) return;
    this.descargando.set(dia.fecha);
    try {
      guardar(await this.descargarDiaUseCase.execute(dia.fecha), `log_${dia.fecha}.log`);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo descargar el log de ese día'), 'error');
    } finally {
      this.descargando.set(null);
    }
  }

  async descargarTodos(): Promise<void> {
    if (this.descargando()) return;
    this.descargando.set('todos');
    try {
      const ahora = new Date();
      const hora = `${dos(ahora.getHours())}${dos(ahora.getMinutes())}`;
      guardar(await this.descargarTodosUseCase.execute(), `logs_${claveLocal(ahora).replaceAll('-', '')}_${hora}.zip`);
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudieron descargar los logs'), 'error');
    } finally {
      this.descargando.set(null);
    }
  }
}

/** La app de escritorio muestra el diálogo "Guardar como" para la descarga. */
function guardar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function fechaLocal(clave: string): Date {
  const [a, m, d] = clave.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function claveLocal(fecha: Date): string {
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function dos(n: number): string {
  return String(n).padStart(2, '0');
}
