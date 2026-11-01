import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ColoresTema,
  ConfiguracionEstilo,
  ESTILO_NEUTRAL,
  estiloTexto,
  HEX_COLOR,
  TAMANO_BASE,
  TITULO_BIENVENIDA_DEFECTO,
} from './tema.model';

const CACHE_KEY = 'sc_estilo';
const TEXTO_OSCURO = '#111827';
const TEXTO_CLARO = '#ffffff';

/**
 * Aplica la apariencia configurada (Configuración > Estilos) a toda la app.
 * Escribe los 5 colores base como variables CSS sobre <html>; styles.scss deriva
 * de ellos el resto de tokens. Se guarda una copia local para que al abrir la app
 * no se vea primero el tema neutral mientras responde el backend.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  /** Estilo guardado (el vigente fuera de la pantalla de edición). */
  private readonly guardado = signal<ConfiguracionEstilo>(leerCache() ?? ESTILO_NEUTRAL);
  /** Vista previa en curso desde Configuración > Estilos (aún sin guardar). */
  private readonly previa = signal<ConfiguracionEstilo | null>(null);

  readonly estilo = computed(() => this.previa() ?? this.guardado());
  readonly estiloGuardado = this.guardado.asReadonly();
  readonly logoUrl = computed(() => dataUrl(this.estilo().logoBase64));
  readonly imagenLoginUrl = computed(() => dataUrl(this.estilo().imagenLoginBase64));
  readonly nombreNegocio = computed(() => this.estilo().nombreNegocio ?? '');
  readonly lema = computed(() => this.estilo().lema ?? '');
  readonly tituloBienvenida = computed(() => this.estilo().tituloBienvenida || TITULO_BIENVENIDA_DEFECTO);
  readonly textoNombre = computed(() => estiloTexto(this.estilo().fuenteNombre, this.estilo().tamanoNombre, TAMANO_BASE.nombre));
  readonly textoTitulo = computed(() => estiloTexto(this.estilo().fuenteTitulo, this.estilo().tamanoTitulo, TAMANO_BASE.titulo));
  readonly textoLema = computed(() => estiloTexto(this.estilo().fuenteLema, this.estilo().tamanoLema, TAMANO_BASE.lema));

  constructor() {
    this.aplicarColores(this.guardado());
  }

  /** Trae el estilo del backend. Si no responde se queda con la copia local. */
  async cargar(): Promise<void> {
    try {
      const estilo = await firstValueFrom(
        this.http.get<ConfiguracionEstilo>(`${environment.apiUrl}/estilos`).pipe(timeout(8000))
      );
      this.establecer(estilo);
    } catch {
      // Sin conexión: se mantiene el último estilo conocido (o el neutral).
    }
  }

  /** Estilo recién guardado: pasa a ser el vigente. */
  establecer(estilo: ConfiguracionEstilo): void {
    this.guardado.set(estilo);
    guardarCache(estilo);
    if (!this.previa()) this.aplicarColores(estilo);
  }

  /** Muestra en toda la app un estilo aún sin guardar. */
  previsualizar(estilo: ConfiguracionEstilo): void {
    this.previa.set(estilo);
    this.aplicarColores(estilo);
  }

  /** Termina la vista previa y vuelve al estilo guardado. */
  cancelarPrevia(): void {
    this.previa.set(null);
    this.aplicarColores(this.guardado());
  }

  private aplicarColores(c: ColoresTema): void {
    const raiz = this.document.documentElement.style;
    const colores = coloresValidos(c);
    raiz.setProperty('--tema-primario', colores.colorPrimario);
    raiz.setProperty('--tema-acento', colores.colorAcento);
    raiz.setProperty('--tema-destacado', colores.colorDestacado);
    raiz.setProperty('--tema-fondo', colores.colorFondo);
    raiz.setProperty('--tema-texto', colores.colorTexto);
    raiz.setProperty('--tema-sobre-primario', textoSobre(colores.colorPrimario));
    raiz.setProperty('--tema-sobre-acento', textoSobre(colores.colorAcento));
    raiz.setProperty('--tema-sobre-destacado', textoSobre(colores.colorDestacado));
  }
}

// ── Utilidades de color ─────────────────────────────────────────────────────

function coloresValidos(c: ColoresTema): ColoresTema {
  const v = (valor: string, defecto: string) => (HEX_COLOR.test(valor ?? '') ? valor : defecto);
  return {
    colorPrimario: v(c.colorPrimario, ESTILO_NEUTRAL.colorPrimario),
    colorAcento: v(c.colorAcento, ESTILO_NEUTRAL.colorAcento),
    colorDestacado: v(c.colorDestacado, ESTILO_NEUTRAL.colorDestacado),
    colorFondo: v(c.colorFondo, ESTILO_NEUTRAL.colorFondo),
    colorTexto: v(c.colorTexto, ESTILO_NEUTRAL.colorTexto),
  };
}

/** Luminancia relativa WCAG de un color #rrggbb. */
export function luminancia(hex: string): number {
  const canal = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

/** Relación de contraste WCAG entre dos colores #rrggbb (1 a 21). */
export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Blanco u oscuro, el que mejor se lea sobre el color dado. */
export function textoSobre(fondo: string): string {
  return contraste(fondo, TEXTO_CLARO) >= contraste(fondo, TEXTO_OSCURO) ? TEXTO_CLARO : TEXTO_OSCURO;
}

function dataUrl(base64: string | null | undefined): string | null {
  return base64 ? `data:image/png;base64,${base64}` : null;
}

function leerCache(): ConfiguracionEstilo | null {
  try {
    const crudo = localStorage.getItem(CACHE_KEY);
    return crudo ? { ...ESTILO_NEUTRAL, ...(JSON.parse(crudo) as Partial<ConfiguracionEstilo>) } : null;
  } catch {
    return null;
  }
}

function guardarCache(estilo: ConfiguracionEstilo): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(estilo));
  } catch {
    // Sin espacio: la próxima vez se verá el neutral hasta que responda el backend.
  }
}
