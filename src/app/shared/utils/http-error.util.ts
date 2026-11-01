import { HttpErrorResponse } from '@angular/common/http';

export function extraerMensajeError(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const mensaje = (error.error as { mensaje?: string } | null)?.mensaje;
    if (mensaje) return mensaje;
  }
  return fallback;
}
