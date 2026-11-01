import { LineaTicket } from '../../caja/domain/venta.model';

export type { LineaTicket };

export type TipoConexion = 'SPOOLER' | 'RED';

/** BARRAS = CODE128, el mismo formato de las etiquetas de productos (lo lee la pistola lectora). */
export type FormatoCodigoVenta = 'QR' | 'BARRAS';

export interface ConfiguracionImpresion {
  // Impresora
  conexion: TipoConexion;
  nombreImpresora: string | null;
  host: string | null;
  puerto: number;
  anchoCaracteres: number;
  corteAutomatico: boolean;
  lineasAvance: number;
  abrirCajon: boolean;
  imprimirAlVender: boolean;
  copias: number;

  // Recibo
  mostrarLogo: boolean;
  /** PNG en Base64 sin prefijo data:. */
  logoBase64: string | null;
  /** Ancho del logo en puntos de impresión (12 puntos = 1 carácter). */
  logoAncho: number;
  titulo: string | null;
  tituloGrande: boolean;
  razonSocial: string | null;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  encabezadoExtra: string | null;
  mostrarNumeroVenta: boolean;
  mostrarCajero: boolean;
  mostrarMetodoPago: boolean;
  mostrarReceptor: boolean;
  mostrarDecimales: boolean;
  /** Muestra el código con el número de la venta (QR o barras). */
  mostrarQr: boolean;
  formatoCodigoVenta: FormatoCodigoVenta;
  mensajePie: string | null;
  pieExtra: string | null;

  // Solo lectura
  fechaActualizacion?: string | null;
  usuarioActualizacion?: string | null;
}

export interface ImpresoraDisponible {
  nombre: string;
  predeterminada: boolean;
}

export interface ResultadoConexion {
  exitosa: boolean;
  mensaje: string;
}

export type TipoPrueba = 'pagina' | 'recibo';

/** Puntos de impresión por carácter (fuente A): 576/48 en 80mm y 384/32 en 58mm. */
export const PUNTOS_POR_CARACTER = 12;

export const ANCHOS_PAPEL: { etiqueta: string; caracteres: number }[] = [
  { etiqueta: '80 mm (48 caracteres)', caracteres: 48 },
  { etiqueta: '80 mm, fuente reducida (42 caracteres)', caracteres: 42 },
  { etiqueta: '58 mm (32 caracteres)', caracteres: 32 },
];
