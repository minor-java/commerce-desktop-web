import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { ObtenerConfiguracionImpresionUseCase } from '../../../application/use-cases/obtener-configuracion-impresion.use-case';
import { GuardarConfiguracionImpresionUseCase } from '../../../application/use-cases/guardar-configuracion-impresion.use-case';
import { VistaPreviaReciboUseCase } from '../../../application/use-cases/vista-previa-recibo.use-case';
import { ListarImpresorasUseCase } from '../../../application/use-cases/listar-impresoras.use-case';
import { ProbarConexionImpresoraUseCase } from '../../../application/use-cases/probar-conexion-impresora.use-case';
import { ImprimirPruebaUseCase } from '../../../application/use-cases/imprimir-prueba.use-case';
import {
  ANCHOS_PAPEL,
  ConfiguracionImpresion,
  FormatoCodigoVenta,
  ImpresoraDisponible,
  LineaTicket,
  PUNTOS_POR_CARACTER,
  ResultadoConexion,
  TipoPrueba,
} from '../../../domain/impresion.model';
import { ReciboPreviewComponent } from '../../components/recibo-preview/recibo-preview.component';

type Pestana = 'recibo' | 'impresora';

const LOGO_MAX_BYTES = 3 * 1024 * 1024;
const LOGO_ANCHO_MIN = 48;

@Component({
  selector: 'app-impresion',
  imports: [ReactiveFormsModule, DatePipe, ReciboPreviewComponent],
  templateUrl: './impresion.component.html',
  styleUrl: './impresion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpresionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly obtenerUseCase = inject(ObtenerConfiguracionImpresionUseCase);
  private readonly guardarUseCase = inject(GuardarConfiguracionImpresionUseCase);
  private readonly vistaPreviaUseCase = inject(VistaPreviaReciboUseCase);
  private readonly listarImpresorasUseCase = inject(ListarImpresorasUseCase);
  private readonly probarConexionUseCase = inject(ProbarConexionImpresoraUseCase);
  private readonly imprimirPruebaUseCase = inject(ImprimirPruebaUseCase);

  readonly anchosPapel = ANCHOS_PAPEL;
  readonly logoAnchoMin = LOGO_ANCHO_MIN;

  readonly form = this.fb.nonNullable.group({
    // Impresora
    conexion: this.fb.nonNullable.control<'SPOOLER' | 'RED'>('SPOOLER'),
    nombreImpresora: [''],
    host: [''],
    puerto: [9100, [Validators.required, Validators.min(1), Validators.max(65535)]],
    anchoCaracteres: [48, [Validators.required, Validators.min(24), Validators.max(64)]],
    corteAutomatico: [true],
    lineasAvance: [3, [Validators.required, Validators.min(0), Validators.max(10)]],
    abrirCajon: [true],
    imprimirAlVender: [true],
    copias: [1, [Validators.required, Validators.min(1), Validators.max(3)]],
    // Recibo
    mostrarLogo: [false],
    logoBase64: this.fb.nonNullable.control<string | null>(null),
    logoAncho: [384],
    titulo: ['', Validators.maxLength(100)],
    tituloGrande: [true],
    razonSocial: ['', Validators.maxLength(150)],
    nit: ['', Validators.maxLength(50)],
    direccion: ['', Validators.maxLength(200)],
    telefono: ['', Validators.maxLength(50)],
    encabezadoExtra: ['', Validators.maxLength(500)],
    mostrarNumeroVenta: [true],
    mostrarCajero: [true],
    mostrarMetodoPago: [true],
    mostrarReceptor: [true],
    mostrarDecimales: [true],
    mostrarQr: [true],
    formatoCodigoVenta: ['QR' as FormatoCodigoVenta],
    mensajePie: ['', Validators.maxLength(200)],
    pieExtra: ['', Validators.maxLength(500)],
  });

  /** Copia del formulario como signal (para computed). */
  private readonly valor = signal(this.form.getRawValue());

  readonly mostrarCodigoVenta = computed(() => this.valor().mostrarQr);
  readonly formatoCodigoVenta = computed(() => this.valor().formatoCodigoVenta);

  readonly pestana = signal<Pestana>('recibo');
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly sinGuardar = signal(false);
  readonly ultimaActualizacion = signal<{ fecha: string; usuario: string | null } | null>(null);

  readonly lineas = signal<LineaTicket[]>([]);
  readonly actualizandoVista = signal(false);
  readonly errorVista = signal<string | null>(null);

  readonly impresoras = signal<ImpresoraDisponible[]>([]);
  readonly buscandoImpresoras = signal(false);
  readonly resultadoBusqueda = signal<string | null>(null);
  readonly probando = signal(false);
  readonly resultadoConexion = signal<ResultadoConexion | null>(null);
  readonly imprimiendo = signal<TipoPrueba | null>(null);

  readonly anchoPersonalizado = signal(false);

  readonly ancho = computed(() => this.valor().anchoCaracteres ?? 48);
  readonly esRed = computed(() => this.valor().conexion === 'RED');
  readonly tieneLogo = computed(() => !!this.valor().logoBase64);
  readonly logoBase64 = computed(() => this.valor().logoBase64 ?? null);
  readonly logoAncho = computed(() => this.valor().logoAncho ?? 384);
  readonly logoAnchoMax = computed(() => this.ancho() * PUNTOS_POR_CARACTER);
  readonly logoAnchoPorcentaje = computed(() =>
    Math.round(((this.valor().logoAncho ?? 0) / this.logoAnchoMax()) * 100)
  );
  readonly valorSelectAncho = computed(() =>
    this.anchoPersonalizado() || !ANCHOS_PAPEL.some(a => a.caracteres === this.ancho()) ? 'otro' : String(this.ancho())
  );
  /** La impresora guardada ya no aparece entre las instaladas en Windows. */
  readonly impresoraNoInstalada = computed(() => {
    const nombre = this.valor().nombreImpresora;
    return !!nombre && !this.buscandoImpresoras() && !this.impresoras().some(i => i.nombre === nombre);
  });

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.valor.set(this.form.getRawValue()));

    this.form.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.sinGuardar.set(true);
      this.actualizarVista();
    });

    // Si el papel se angosta, el logo no puede quedar más ancho que el papel.
    this.form.controls.anchoCaracteres.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ancho => {
        const max = (ancho ?? 48) * PUNTOS_POR_CARACTER;
        if (this.form.controls.logoAncho.value > max) {
          this.form.controls.logoAncho.setValue(max, { emitEvent: false });
        }
      });

    this.cargar();
    this.buscarImpresoras();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set(null);
    try {
      this.aplicar(await this.obtenerUseCase.execute());
      this.ajustarNombreImpresora();
      await this.actualizarVista();
    } catch (err) {
      this.errorCarga.set(extraerMensajeError(err, 'No se pudo cargar la configuración de impresión'));
    } finally {
      this.cargando.set(false);
    }
  }

  private aplicar(config: ConfiguracionImpresion): void {
    this.form.reset(
      {
        ...config,
        nombreImpresora: config.nombreImpresora ?? '',
        host: config.host ?? '',
        titulo: config.titulo ?? '',
        razonSocial: config.razonSocial ?? '',
        nit: config.nit ?? '',
        direccion: config.direccion ?? '',
        telefono: config.telefono ?? '',
        encabezadoExtra: config.encabezadoExtra ?? '',
        mensajePie: config.mensajePie ?? '',
        pieExtra: config.pieExtra ?? '',
      },
      { emitEvent: false }
    );
    this.valor.set(this.form.getRawValue());
    this.anchoPersonalizado.set(!ANCHOS_PAPEL.some(a => a.caracteres === config.anchoCaracteres));
    this.sinGuardar.set(false);
    this.resultadoConexion.set(null);
    this.ultimaActualizacion.set(
      config.fechaActualizacion ? { fecha: config.fechaActualizacion, usuario: config.usuarioActualizacion ?? null } : null
    );
  }

  private configuracion(): ConfiguracionImpresion {
    const v = this.form.getRawValue();
    return {
      ...v,
      nombreImpresora: v.nombreImpresora || null,
      host: v.host.trim() || null,
    };
  }

  /** Solo se aplica la respuesta de la última solicitud (descarta respuestas que lleguen desordenadas). */
  private solicitudVista = 0;

  private async actualizarVista(): Promise<void> {
    const solicitud = ++this.solicitudVista;
    this.actualizandoVista.set(true);
    try {
      const lineas = await this.vistaPreviaUseCase.execute(this.configuracion());
      if (solicitud !== this.solicitudVista) return;
      this.lineas.set(lineas);
      this.errorVista.set(null);
    } catch (err) {
      if (solicitud !== this.solicitudVista) return;
      this.errorVista.set(extraerMensajeError(err, 'No se pudo generar la vista previa'));
    } finally {
      if (solicitud === this.solicitudVista) this.actualizandoVista.set(false);
    }
  }

  // ── Pestañas ────────────────────────────────────────────────────────────────

  seleccionarPestana(p: Pestana): void {
    this.pestana.set(p);
  }

  /** Navegación con flechas entre pestañas (patrón ARIA tabs). */
  teclaPestana(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const siguiente: Pestana = this.pestana() === 'recibo' ? 'impresora' : 'recibo';
    this.pestana.set(siguiente);
    document.getElementById(`tab-${siguiente}`)?.focus();
  }

  // ── Impresora ───────────────────────────────────────────────────────────────

  /**
   * @param manual true cuando el usuario pulsa "Actualizar lista": se muestra el resultado
   * (cuántas hay y cuáles aparecieron o desaparecieron), porque la consulta tarda milisegundos
   * y sin ese mensaje parece que el botón no hizo nada.
   */
  async buscarImpresoras(manual = false): Promise<void> {
    const anteriores = new Set(this.impresoras().map(i => i.nombre));
    this.buscandoImpresoras.set(true);
    if (manual) this.resultadoBusqueda.set(null);
    try {
      const [lista] = await Promise.all([
        this.listarImpresorasUseCase.execute(),
        // Deja ver el estado "Buscando…" aunque la respuesta sea inmediata.
        manual ? new Promise(r => setTimeout(r, 400)) : Promise.resolve(),
      ]);
      this.impresoras.set(lista);
      this.ajustarNombreImpresora();
      if (manual) this.resultadoBusqueda.set(this.describirCambios(anteriores, lista));
    } catch (err) {
      const mensaje = extraerMensajeError(err, 'No se pudo consultar las impresoras instaladas');
      if (manual) this.resultadoBusqueda.set(mensaje);
      this.toast.show(mensaje, 'error');
    } finally {
      this.buscandoImpresoras.set(false);
    }
  }

  private describirCambios(anteriores: Set<string>, lista: ImpresoraDisponible[]): string {
    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const total = lista.length === 1 ? '1 impresora instalada' : `${lista.length} impresoras instaladas`;
    const nuevas = lista.filter(i => !anteriores.has(i.nombre)).map(i => i.nombre);
    const actuales = new Set(lista.map(i => i.nombre));
    const quitadas = [...anteriores].filter(n => !actuales.has(n));
    const partes = [`Lista actualizada a las ${hora}: ${total}.`];
    if (nuevas.length) partes.push(`Nuevas: ${nuevas.join(', ')}.`);
    if (quitadas.length) partes.push(`Ya no están: ${quitadas.join(', ')}.`);
    if (!nuevas.length && !quitadas.length && lista.length) partes.push('Sin cambios.');
    return partes.join(' ');
  }

  /**
   * Configuraciones antiguas guardan parte del nombre (p. ej. "TM-T20IIIL"). Si coincide con una
   * sola impresora instalada se preselecciona su nombre completo (queda como cambio sin guardar).
   */
  private ajustarNombreImpresora(): void {
    const control = this.form.controls.nombreImpresora;
    const nombre = control.value.toLowerCase();
    const lista = this.impresoras();
    if (!nombre || lista.length === 0 || lista.some(i => i.nombre === control.value)) return;
    const coincidencias = lista.filter(i => i.nombre.toLowerCase().includes(nombre));
    if (coincidencias.length === 1) {
      control.setValue(coincidencias[0].nombre);
      control.markAsDirty();
    }
  }

  cambiarAnchoPapel(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    if (valor === 'otro') {
      this.anchoPersonalizado.set(true);
      return;
    }
    this.anchoPersonalizado.set(false);
    this.form.controls.anchoCaracteres.setValue(Number(valor));
  }

  private validarImpresora(): string | null {
    const v = this.form.getRawValue();
    if (v.conexion === 'SPOOLER' && !v.nombreImpresora) return 'Seleccione una impresora.';
    if (v.conexion === 'RED' && !v.host.trim()) return 'Ingrese la dirección IP de la impresora.';
    if (this.form.invalid) return 'Revise los campos marcados.';
    return null;
  }

  async probarConexion(): Promise<void> {
    const error = this.validarImpresora();
    if (error) {
      this.resultadoConexion.set({ exitosa: false, mensaje: error });
      return;
    }
    this.probando.set(true);
    this.resultadoConexion.set(null);
    try {
      this.resultadoConexion.set(await this.probarConexionUseCase.execute(this.configuracion()));
    } catch (err) {
      this.resultadoConexion.set({ exitosa: false, mensaje: extraerMensajeError(err, 'No se pudo probar la conexión') });
    } finally {
      this.probando.set(false);
    }
  }

  async imprimirPrueba(tipo: TipoPrueba): Promise<void> {
    const error = this.validarImpresora();
    if (error) {
      this.toast.show(error, 'error');
      return;
    }
    this.imprimiendo.set(tipo);
    try {
      await this.imprimirPruebaUseCase.execute(this.configuracion(), tipo);
      this.toast.show(tipo === 'recibo' ? 'Recibo de ejemplo enviado a la impresora.' : 'Página de prueba enviada a la impresora.', 'success');
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo imprimir'), 'error');
    } finally {
      this.imprimiendo.set(null);
    }
  }

  // ── Logo ────────────────────────────────────────────────────────────────────

  logoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      this.toast.show('Seleccione una imagen PNG, JPG, GIF o BMP.', 'error');
      return;
    }
    if (archivo.size > LOGO_MAX_BYTES) {
      this.toast.show('La imagen no puede superar 3 MB.', 'error');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      const dataUrl = String(lector.result);
      const img = new Image();
      img.onload = () => {
        const ancho = Math.max(LOGO_ANCHO_MIN, Math.min(img.naturalWidth, this.logoAnchoMax()));
        // El navegador convierte a PNG (y aplana la transparencia en el backend).
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        const png = canvas.toDataURL('image/png');
        this.form.patchValue({
          logoBase64: png.substring(png.indexOf(',') + 1),
          logoAncho: ancho,
          mostrarLogo: true,
        });
      };
      img.onerror = () => this.toast.show('No se pudo leer la imagen.', 'error');
      img.src = dataUrl;
    };
    lector.readAsDataURL(archivo);
  }

  quitarLogo(): void {
    this.form.patchValue({ logoBase64: null, mostrarLogo: false });
  }

  // ── Guardar ─────────────────────────────────────────────────────────────────

  async guardar(): Promise<void> {
    const error = this.validarImpresora();
    if (error) {
      this.form.markAllAsTouched();
      this.toast.show(error, 'error');
      if (error.includes('impresora') || error.includes('IP')) this.pestana.set('impresora');
      return;
    }
    this.guardando.set(true);
    try {
      this.aplicar(await this.guardarUseCase.execute(this.configuracion()));
      this.toast.show('Configuración de impresión guardada.', 'success');
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudo guardar la configuración'), 'error');
    } finally {
      this.guardando.set(false);
    }
  }

  async descartar(): Promise<void> {
    await this.cargar();
  }
}
