export interface Respaldo {
  archivo: string;
  tamanoBytes: number;
  /** ISO-8601 en hora local del equipo. */
  fechaCreacion: string;
  usuario: string;
  versionApp: string;
  versionEsquema: string;
  /** Etiqueta → cantidad de registros (Productos, Ventas, ...). */
  conteos: Record<string, number>;
}

export interface VistaPreviaRespaldo {
  /** Id del archivo subido; null si es un respaldo del historial. */
  cargaId: string | null;
  respaldo: Respaldo;
  versionEsquemaActual: string;
  /** Motivos que impiden restaurar ahora mismo. */
  bloqueos: string[];
  puedeRestaurar: boolean;
}

export interface RestaurarRespaldo {
  cargaId: string | null;
  archivo: string | null;
  contrasena: string;
  confirmacion: string;
}

export const CONFIRMACION_RESTAURAR = 'RESTAURAR';
export const EXTENSION_RESPALDO = '.cdbak';

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
