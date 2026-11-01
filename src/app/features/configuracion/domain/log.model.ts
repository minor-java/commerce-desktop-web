/** Un día con registros (logs) guardados en este equipo. */
export interface DiaLog {
  /** AAAA-MM-DD, hora local del equipo. */
  fecha: string;
  /** Tamaño en disco (los días anteriores están comprimidos; la descarga es más grande). */
  tamanoBytes: number;
  /** Hay registros del servidor para ese día. */
  servidor: boolean;
  /** Hay registros de la app de escritorio para ese día. */
  escritorio: boolean;
}

/** Debe coincidir con logging.logback.rollingpolicy.max-history (backend) y DIAS_RETENCION (Electron). */
export const DIAS_RETENCION_LOGS = 30;
