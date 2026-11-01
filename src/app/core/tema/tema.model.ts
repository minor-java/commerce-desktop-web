/**
 * Apariencia de la aplicación (Configuración > Estilos).
 * Solo color e imágenes: el tema nunca cambia tamaños ni espacios.
 */
export interface ColoresTema {
  /** Títulos, botón principal, menú activo. */
  colorPrimario: string;
  /** Botones de acción, selección, foco, bordes suaves. */
  colorAcento: string;
  /** Líneas decorativas, insignias, ranking. */
  colorDestacado: string;
  /** Fondo general de la aplicación. */
  colorFondo: string;
  /** Texto general (el texto secundario se deriva de este). */
  colorTexto: string;
}

export interface ConfiguracionEstilo extends ColoresTema {
  /** PNG en Base64 sin prefijo data:. null = logo neutral por defecto. */
  logoBase64: string | null;
  /** Imagen pequeña del divisor del login. null = sin imagen (línea simple). */
  imagenLoginBase64: string | null;
  nombreNegocio: string | null;
  lema: string | null;
  tituloBienvenida: string | null;
  /** Fuente (id de FUENTES) y tamaño (id de TAMANOS) de cada texto del login; null = por defecto. */
  fuenteNombre?: string | null;
  tamanoNombre?: string | null;
  fuenteTitulo?: string | null;
  tamanoTitulo?: string | null;
  fuenteLema?: string | null;
  tamanoLema?: string | null;
  fechaActualizacion?: string | null;
  usuarioActualizacion?: string | null;
}

/** Debe coincidir con :root en styles.scss y con ConfiguracionEstiloService del backend. */
export const COLORES_NEUTRALES: ColoresTema = {
  colorPrimario: '#1f2937',
  colorAcento: '#475569',
  colorDestacado: '#94a3b8',
  colorFondo: '#f3f4f6',
  colorTexto: '#1f2937',
};

export const ESTILO_NEUTRAL: ConfiguracionEstilo = {
  ...COLORES_NEUTRALES,
  logoBase64: null,
  imagenLoginBase64: null,
  nombreNegocio: null,
  lema: null,
  tituloBienvenida: null,
  fuenteNombre: null,
  tamanoNombre: null,
  fuenteTitulo: null,
  tamanoTitulo: null,
  fuenteLema: null,
  tamanoLema: null,
};

export const TITULO_BIENVENIDA_DEFECTO = 'Bienvenido';

export interface PaletaPredefinida {
  id: string;
  nombre: string;
  colores: ColoresTema;
}

export const PALETAS: PaletaPredefinida[] = [
  { id: 'neutral', nombre: 'Neutral', colores: COLORES_NEUTRALES },
  {
    id: 'grafito',
    nombre: 'Grafito',
    colores: { colorPrimario: '#18181b', colorAcento: '#27272a', colorDestacado: '#a1a1aa', colorFondo: '#f4f4f5', colorTexto: '#18181b' },
  },
  {
    id: 'azul',
    nombre: 'Azul',
    colores: { colorPrimario: '#1e3a5f', colorAcento: '#2563eb', colorDestacado: '#f59e0b', colorFondo: '#f1f5f9', colorTexto: '#1e293b' },
  },
  {
    id: 'verde',
    nombre: 'Verde',
    colores: { colorPrimario: '#14532d', colorAcento: '#15803d', colorDestacado: '#ca8a04', colorFondo: '#f0fdf4', colorTexto: '#1c2a21' },
  },
  {
    id: 'vino',
    nombre: 'Vino',
    colores: { colorPrimario: '#4c0519', colorAcento: '#be123c', colorDestacado: '#d4a373', colorFondo: '#fdf2f4', colorTexto: '#2b1218' },
  },
  {
    id: 'rosa',
    nombre: 'Rosa y dorado',
    colores: { colorPrimario: '#3d1535', colorAcento: '#e89ac1', colorDestacado: '#d4af37', colorFondo: '#f8eef4', colorTexto: '#2d1a27' },
  },
];

export const CLAVES_COLOR: (keyof ColoresTema)[] = [
  'colorPrimario',
  'colorAcento',
  'colorDestacado',
  'colorFondo',
  'colorTexto',
];

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// ── Tipografía de los textos del login ─────────────────────────────────────
// Solo fuentes que trae Windows 10/11: la app funciona sin internet.
// Cada familia termina en una genérica por si el equipo no tiene la fuente.

export type TipoFuente = 'sans' | 'serif' | 'manuscrita';

export interface OpcionFuente {
  id: string;
  nombre: string;
  familia: string;
  tipo: TipoFuente;
}

export const FUENTE_DEFECTO = 'segoe';

export const FUENTES: OpcionFuente[] = [
  { id: 'segoe', nombre: 'Moderna (Segoe UI)', familia: "'Segoe UI', system-ui, sans-serif", tipo: 'sans' },
  { id: 'bahnschrift', nombre: 'Geométrica (Bahnschrift)', familia: "Bahnschrift, 'Segoe UI', sans-serif", tipo: 'sans' },
  { id: 'corbel', nombre: 'Suave (Corbel)', familia: "Corbel, 'Segoe UI', sans-serif", tipo: 'sans' },
  { id: 'trebuchet', nombre: 'Amigable (Trebuchet MS)', familia: "'Trebuchet MS', 'Segoe UI', sans-serif", tipo: 'sans' },
  { id: 'georgia', nombre: 'Clásica (Georgia)', familia: "Georgia, 'Times New Roman', serif", tipo: 'serif' },
  { id: 'palatino', nombre: 'Elegante (Palatino)', familia: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", tipo: 'serif' },
  { id: 'constantia', nombre: 'Editorial (Constantia)', familia: "Constantia, Georgia, serif", tipo: 'serif' },
  { id: 'sitka', nombre: 'Refinada (Sitka)', familia: "'Sitka Heading', Sitka, Georgia, serif", tipo: 'serif' },
  { id: 'segoe-script', nombre: 'Manuscrita (Segoe Script)', familia: "'Segoe Script', cursive", tipo: 'manuscrita' },
  { id: 'gabriola', nombre: 'Caligráfica (Gabriola)', familia: "Gabriola, 'Segoe Script', cursive", tipo: 'manuscrita' },
  { id: 'segoe-print', nombre: 'Informal (Segoe Print)', familia: "'Segoe Print', cursive", tipo: 'manuscrita' },
  { id: 'ink-free', nombre: 'A mano (Ink Free)', familia: "'Ink Free', 'Segoe Print', cursive", tipo: 'manuscrita' },
];

export interface OpcionTamano {
  id: string;
  nombre: string;
  escala: number;
}

export const TAMANO_DEFECTO = 'normal';

export const TAMANOS: OpcionTamano[] = [
  { id: 'pequeno', nombre: 'Pequeño', escala: 0.85 },
  { id: 'normal', nombre: 'Normal', escala: 1 },
  { id: 'grande', nombre: 'Grande', escala: 1.25 },
  { id: 'muy-grande', nombre: 'Muy grande', escala: 1.5 },
];

/** Tamaño "Normal" de cada texto (rem): el que tenía el diseño original. */
export const TAMANO_BASE = { nombre: 0.8, titulo: 1.875, lema: 1.0625 } as const;

export interface EstiloTexto {
  familia: string;
  tamanoRem: number;
  /** Las manuscritas ya son inclinadas: no se les aplica cursiva sintética. */
  manuscrita: boolean;
}

export function estiloTexto(fuenteId: string | null | undefined, tamanoId: string | null | undefined, baseRem: number): EstiloTexto {
  const fuente = FUENTES.find(f => f.id === fuenteId) ?? FUENTES.find(f => f.id === FUENTE_DEFECTO)!;
  const tamano = TAMANOS.find(t => t.id === tamanoId) ?? TAMANOS.find(t => t.id === TAMANO_DEFECTO)!;
  return { familia: fuente.familia, tamanoRem: +(baseRem * tamano.escala).toFixed(3), manuscrita: fuente.tipo === 'manuscrita' };
}
