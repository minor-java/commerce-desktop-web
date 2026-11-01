import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../../shared/services/toast.service';
import { extraerMensajeError } from '../../../../../shared/utils/http-error.util';
import { TemaService, contraste } from '../../../../../core/tema/tema.service';
import {
  CLAVES_COLOR,
  ESTILO_NEUTRAL,
  estiloTexto,
  EstiloTexto,
  FUENTE_DEFECTO,
  FUENTES,
  HEX_COLOR,
  PALETAS,
  TAMANO_BASE,
  TAMANO_DEFECTO,
  TAMANOS,
  TipoFuente,
  TITULO_BIENVENIDA_DEFECTO,
} from '../../../../../core/tema/tema.model';
import { ColoresTema, ConfiguracionEstilo, PaletaPredefinida } from '../../../domain/estilo.model';
import { ObtenerEstiloUseCase } from '../../../application/use-cases/obtener-estilo.use-case';
import { GuardarEstiloUseCase } from '../../../application/use-cases/guardar-estilo.use-case';

type CampoImagen = 'logo' | 'imagenLogin';

const IMAGEN_MAX_BYTES = 3 * 1024 * 1024;
const IMAGEN_MAX_LADO = 512;
const PATRON_HEX = /^#[0-9a-fA-F]{6}$/;

type ClaveTexto = 'nombreNegocio' | 'tituloBienvenida' | 'lema';
type ClaveFuente = 'fuenteNombre' | 'fuenteTitulo' | 'fuenteLema';
type ClaveTamano = 'tamanoNombre' | 'tamanoTitulo' | 'tamanoLema';

interface DescripcionTexto {
  clave: ClaveTexto;
  fuente: ClaveFuente;
  tamano: ClaveTamano;
  etiqueta: string;
  max: number;
  placeholder: string;
  ayuda: string | null;
  ejemplo: string;
}

const NOMBRES_TIPO: Record<TipoFuente, string> = { sans: 'Modernas', serif: 'Clásicas', manuscrita: 'Manuscritas' };

interface DescripcionColor {
  clave: keyof ColoresTema;
  nombre: string;
  ayuda: string;
}

@Component({
  selector: 'app-estilos',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './estilos.component.html',
  styleUrl: './estilos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstilosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly tema = inject(TemaService);
  private readonly obtenerUseCase = inject(ObtenerEstiloUseCase);
  private readonly guardarUseCase = inject(GuardarEstiloUseCase);

  readonly paletas = PALETAS;
  readonly tituloDefecto = TITULO_BIENVENIDA_DEFECTO;
  readonly colores: DescripcionColor[] = [
    { clave: 'colorPrimario', nombre: 'Primario', ayuda: 'Títulos, botón principal y opción activa del menú.' },
    { clave: 'colorAcento', nombre: 'Acento', ayuda: 'Botones de acción, selección, paginador y foco.' },
    { clave: 'colorDestacado', nombre: 'Destacado', ayuda: 'Líneas decorativas, insignias y ranking del inicio.' },
    { clave: 'colorFondo', nombre: 'Fondo', ayuda: 'Fondo general de la aplicación y del menú.' },
    { clave: 'colorTexto', nombre: 'Texto', ayuda: 'Texto general; el texto secundario se deriva de este.' },
  ];

  readonly tamanos = TAMANOS;
  readonly gruposFuentes = (Object.keys(NOMBRES_TIPO) as TipoFuente[]).map(tipo => ({
    tipo,
    nombre: NOMBRES_TIPO[tipo],
    fuentes: FUENTES.filter(f => f.tipo === tipo),
  }));
  readonly textos: DescripcionTexto[] = [
    {
      clave: 'nombreNegocio', fuente: 'fuenteNombre', tamano: 'tamanoNombre', etiqueta: 'Nombre del negocio', max: 40,
      placeholder: 'Opcional', ayuda: 'Una palabra corta se reparte letra por letra bajo el logo.', ejemplo: 'Mi negocio',
    },
    {
      clave: 'tituloBienvenida', fuente: 'fuenteTitulo', tamano: 'tamanoTitulo', etiqueta: 'Título de bienvenida', max: 40,
      placeholder: TITULO_BIENVENIDA_DEFECTO, ayuda: null, ejemplo: TITULO_BIENVENIDA_DEFECTO,
    },
    {
      clave: 'lema', fuente: 'fuenteLema', tamano: 'tamanoLema', etiqueta: 'Lema', max: 80,
      placeholder: 'Opcional', ayuda: null, ejemplo: 'Su lema aquí',
    },
  ];

  readonly form = this.fb.nonNullable.group({
    colorPrimario: [ESTILO_NEUTRAL.colorPrimario, [Validators.required, Validators.pattern(PATRON_HEX)]],
    colorAcento: [ESTILO_NEUTRAL.colorAcento, [Validators.required, Validators.pattern(PATRON_HEX)]],
    colorDestacado: [ESTILO_NEUTRAL.colorDestacado, [Validators.required, Validators.pattern(PATRON_HEX)]],
    colorFondo: [ESTILO_NEUTRAL.colorFondo, [Validators.required, Validators.pattern(PATRON_HEX)]],
    colorTexto: [ESTILO_NEUTRAL.colorTexto, [Validators.required, Validators.pattern(PATRON_HEX)]],
    nombreNegocio: ['', Validators.maxLength(40)],
    lema: ['', Validators.maxLength(80)],
    tituloBienvenida: ['', Validators.maxLength(40)],
    fuenteNombre: FUENTE_DEFECTO,
    tamanoNombre: TAMANO_DEFECTO,
    fuenteTitulo: FUENTE_DEFECTO,
    tamanoTitulo: TAMANO_DEFECTO,
    fuenteLema: FUENTE_DEFECTO,
    tamanoLema: TAMANO_DEFECTO,
  });

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly logo = signal<string | null>(null);
  readonly imagenLogin = signal<string | null>(null);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  private readonly guardado = signal<ConfiguracionEstilo>(ESTILO_NEUTRAL);
  readonly ultimaActualizacion = computed(() => {
    const g = this.guardado();
    return g.fechaActualizacion ? { fecha: g.fechaActualizacion, usuario: g.usuarioActualizacion ?? null } : null;
  });

  /** Estilo tal como está en el formulario. */
  readonly estilo = computed<ConfiguracionEstilo>(() => {
    this.valores();
    const v = this.form.getRawValue();
    return {
      colorPrimario: v.colorPrimario.toLowerCase(),
      colorAcento: v.colorAcento.toLowerCase(),
      colorDestacado: v.colorDestacado.toLowerCase(),
      colorFondo: v.colorFondo.toLowerCase(),
      colorTexto: v.colorTexto.toLowerCase(),
      logoBase64: this.logo(),
      imagenLoginBase64: this.imagenLogin(),
      nombreNegocio: v.nombreNegocio.trim() || null,
      lema: v.lema.trim() || null,
      tituloBienvenida: v.tituloBienvenida.trim() || null,
      fuenteNombre: siNoDefecto(v.fuenteNombre, FUENTE_DEFECTO),
      tamanoNombre: siNoDefecto(v.tamanoNombre, TAMANO_DEFECTO),
      fuenteTitulo: siNoDefecto(v.fuenteTitulo, FUENTE_DEFECTO),
      tamanoTitulo: siNoDefecto(v.tamanoTitulo, TAMANO_DEFECTO),
      fuenteLema: siNoDefecto(v.fuenteLema, FUENTE_DEFECTO),
      tamanoLema: siNoDefecto(v.tamanoLema, TAMANO_DEFECTO),
    };
  });

  /** Fuente y tamaño resueltos de cada texto, para las muestras. */
  readonly muestras = computed<Record<ClaveTexto, EstiloTexto>>(() => {
    const e = this.estilo();
    return {
      nombreNegocio: estiloTexto(e.fuenteNombre, e.tamanoNombre, TAMANO_BASE.nombre),
      tituloBienvenida: estiloTexto(e.fuenteTitulo, e.tamanoTitulo, TAMANO_BASE.titulo),
      lema: estiloTexto(e.fuenteLema, e.tamanoLema, TAMANO_BASE.lema),
    };
  });

  readonly sinGuardar = computed(() => !this.cargando() && claveComparacion(this.estilo()) !== claveComparacion(this.guardado()));

  readonly coloresValidos = computed(() => CLAVES_COLOR.every(c => HEX_COLOR.test(this.estilo()[c])));

  readonly paletaActiva = computed(() => {
    const e = this.estilo();
    return PALETAS.find(p => CLAVES_COLOR.every(c => p.colores[c] === e[c]))?.id ?? null;
  });

  readonly logoUrl = computed(() => urlImagen(this.logo()));
  readonly imagenLoginUrl = computed(() => urlImagen(this.imagenLogin()));

  /** Avisos de legibilidad (WCAG AA: 4.5 para texto normal, 3 para elementos gráficos). */
  readonly avisos = computed(() => {
    if (!this.coloresValidos()) return [];
    const e = this.estilo();
    const avisos: string[] = [];
    if (contraste(e.colorTexto, e.colorFondo) < 4.5) {
      avisos.push('El texto se lee con dificultad sobre el color de fondo.');
    }
    if (contraste(e.colorTexto, '#ffffff') < 4.5) {
      avisos.push('El texto se lee con dificultad sobre las tarjetas y tablas (blancas).');
    }
    if (contraste(e.colorPrimario, '#ffffff') < 3) {
      avisos.push('El color primario es muy claro: los títulos y la opción activa del menú se verán poco.');
    }
    if (contraste(e.colorAcento, '#ffffff') < 3) {
      avisos.push('El color de acento es muy claro: los botones de acción y el foco se distinguirán poco del blanco.');
    }
    return avisos;
  });

  constructor() {
    // Vista previa en vivo en toda la aplicación; al salir sin guardar se revierte.
    inject(DestroyRef).onDestroy(() => this.tema.cancelarPrevia());
  }

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set(null);
    try {
      const estilo = await this.obtenerUseCase.execute();
      this.guardado.set(estilo);
      this.aplicarAlFormulario(estilo);
    } catch (err) {
      this.errorCarga.set(extraerMensajeError(err, 'No se pudo cargar la configuración de estilos'));
    } finally {
      this.cargando.set(false);
    }
  }

  /** Cada cambio se ve de inmediato en toda la app (sin guardar todavía). */
  actualizarVista(): void {
    if (this.coloresValidos()) this.tema.previsualizar(this.estilo());
  }

  aplicarPaleta(paleta: PaletaPredefinida): void {
    this.form.patchValue(paleta.colores);
    this.actualizarVista();
  }

  /** Valor del selector de color al escribir el código a mano (solo si es válido). */
  colorDe(clave: keyof ColoresTema): string {
    const v = this.estilo()[clave];
    return HEX_COLOR.test(v) ? v : '#000000';
  }

  elegirColor(clave: keyof ColoresTema, event: Event): void {
    this.form.controls[clave].setValue((event.target as HTMLInputElement).value);
  }

  textoMuestra(clave: ClaveTexto): string {
    return this.estilo()[clave] ?? this.textos.find(t => t.clave === clave)!.ejemplo;
  }

  restablecerNeutral(): void {
    this.aplicarAlFormulario(ESTILO_NEUTRAL);
    this.actualizarVista();
    this.toast.show('Se cargó el diseño neutral. Guarde para aplicarlo.', 'success');
  }

  descartar(): void {
    this.aplicarAlFormulario(this.guardado());
    this.tema.cancelarPrevia();
  }

  async guardar(): Promise<void> {
    if (this.form.invalid || !this.coloresValidos()) {
      this.form.markAllAsTouched();
      this.toast.show('Revise los colores: use el formato #rrggbb.', 'error');
      return;
    }
    this.guardando.set(true);
    try {
      const guardado = await this.guardarUseCase.execute(this.estilo());
      this.guardado.set(guardado);
      this.aplicarAlFormulario(guardado);
      this.tema.establecer(guardado);
      this.tema.cancelarPrevia();
      this.toast.show('Estilos guardados.', 'success');
    } catch (err) {
      this.toast.show(extraerMensajeError(err, 'No se pudieron guardar los estilos'), 'error');
    } finally {
      this.guardando.set(false);
    }
  }

  // ── Imágenes ────────────────────────────────────────────────────────────────

  imagenSeleccionada(event: Event, campo: CampoImagen): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    if (!/^image\/(png|jpeg|gif|bmp)$/.test(archivo.type)) {
      this.toast.show('Seleccione una imagen PNG, JPG, GIF o BMP.', 'error');
      return;
    }
    if (archivo.size > IMAGEN_MAX_BYTES) {
      this.toast.show('La imagen no puede superar 3 MB.', 'error');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const base64 = aPngBase64(img);
        (campo === 'logo' ? this.logo : this.imagenLogin).set(base64);
        this.actualizarVista();
      };
      img.onerror = () => this.toast.show('No se pudo leer la imagen.', 'error');
      img.src = String(lector.result);
    };
    lector.onerror = () => this.toast.show('No se pudo leer la imagen.', 'error');
    lector.readAsDataURL(archivo);
  }

  quitarImagen(campo: CampoImagen): void {
    (campo === 'logo' ? this.logo : this.imagenLogin).set(null);
    this.actualizarVista();
  }

  private aplicarAlFormulario(e: ConfiguracionEstilo): void {
    this.form.reset({
      colorPrimario: e.colorPrimario,
      colorAcento: e.colorAcento,
      colorDestacado: e.colorDestacado,
      colorFondo: e.colorFondo,
      colorTexto: e.colorTexto,
      nombreNegocio: e.nombreNegocio ?? '',
      lema: e.lema ?? '',
      tituloBienvenida: e.tituloBienvenida ?? '',
      fuenteNombre: e.fuenteNombre || FUENTE_DEFECTO,
      tamanoNombre: e.tamanoNombre || TAMANO_DEFECTO,
      fuenteTitulo: e.fuenteTitulo || FUENTE_DEFECTO,
      tamanoTitulo: e.tamanoTitulo || TAMANO_DEFECTO,
      fuenteLema: e.fuenteLema || FUENTE_DEFECTO,
      tamanoLema: e.tamanoLema || TAMANO_DEFECTO,
    });
    this.logo.set(e.logoBase64);
    this.imagenLogin.set(e.imagenLoginBase64);
  }
}

function urlImagen(base64: string | null): string | null {
  return base64 ? `data:image/png;base64,${base64}` : null;
}

/** Convierte a PNG (conserva la transparencia) y reduce el lado mayor a 512 px. */
function aPngBase64(img: HTMLImageElement): string {
  const escala = Math.min(1, IMAGEN_MAX_LADO / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * escala));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * escala));
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

function claveComparacion(e: ConfiguracionEstilo): string {
  return JSON.stringify([
    ...CLAVES_COLOR.map(c => e[c]?.toLowerCase()),
    e.logoBase64 ?? null,
    e.imagenLoginBase64 ?? null,
    e.nombreNegocio ?? null,
    e.lema ?? null,
    e.tituloBienvenida ?? null,
    e.fuenteNombre ?? null,
    e.tamanoNombre ?? null,
    e.fuenteTitulo ?? null,
    e.tamanoTitulo ?? null,
    e.fuenteLema ?? null,
    e.tamanoLema ?? null,
  ]);
}

function siNoDefecto(valor: string, defecto: string): string | null {
  return valor && valor !== defecto ? valor : null;
}
