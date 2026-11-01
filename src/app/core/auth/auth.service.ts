import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, firstValueFrom, map, Observable, shareReplay } from 'rxjs';
import { AuthRequest, AuthSession, CambiarContrasenaRequest } from './auth.model';
import { Permiso, PERMISOS, RUTAS_INICIALES } from './permisos';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'sc_token';
const SESSION_KEY = 'sc_session';
export const RENEWAL_THRESHOLD_MS = 30 * 60 * 1000;
export const RUTA_CAMBIAR_CONTRASENA = '/cambiar-contrasena';
export const RUTA_SIN_ACCESO = '/sin-acceso';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _session = signal<AuthSession | null>(this.loadSession());
  private renewal$: Observable<string> | null = null;
  private renewalTimer: ReturnType<typeof setTimeout> | null = null;

  readonly session = this._session.asReadonly();
  readonly rol = computed(() => this._session()?.rol ?? null);
  /**
   * El super usuario tiene todos los permisos, incluso los agregados después de su login
   * (el backend hace lo mismo en JwtAuthentication). Con cambio de contraseña pendiente
   * su sesión viene sin permisos a propósito y se respeta.
   */
  readonly permisos = computed(() => {
    const s = this._session();
    const propios = s?.permisos ?? [];
    return s?.superUsuario && propios.length > 0
      ? new Set<string>([...propios, ...Object.values(PERMISOS)])
      : new Set<string>(propios);
  });
  readonly debeCambiarContrasena = computed(() => this._session()?.debeCambiarContrasena ?? false);
  readonly isAuthenticated = computed(() => {
    const s = this._session();
    return s !== null && isTokenValid(s.token);
  });

  constructor() {
    const token = this.getToken();
    if (token && getTokenRemainingMs(token) > 0) {
      this.scheduleRenewal(token);
    }
  }

  async login(request: AuthRequest): Promise<void> {
    const session = await firstValueFrom(
      this.http.post<AuthSession>(`${this.baseUrl}/login`, {
        ...request,
        contrasena: toBase64Utf8(request.contrasena),
      })
    );
    this.setSession(session);
  }

  async cambiarContrasena(request: CambiarContrasenaRequest): Promise<void> {
    const session = await firstValueFrom(
      this.http.post<AuthSession>(`${this.baseUrl}/cambiar-contrasena`, request)
    );
    this.setSession(session);
  }

  logout(): void {
    if (this.renewalTimer !== null) {
      clearTimeout(this.renewalTimer);
      this.renewalTimer = null;
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    this._session.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  tienePermiso(permiso: Permiso): boolean {
    return this.permisos().has(permiso);
  }

  tieneAlgunPermiso(permisos: readonly Permiso[]): boolean {
    const propios = this.permisos();
    return permisos.some(p => propios.has(p));
  }

  /** Primera pantalla a la que el usuario tiene acceso. */
  rutaInicial(): string {
    if (this.debeCambiarContrasena()) return RUTA_CAMBIAR_CONTRASENA;
    return RUTAS_INICIALES.find(r => this.tienePermiso(r.permiso))?.ruta ?? RUTA_SIN_ACCESO;
  }

  /** La renovación relee el usuario en el backend: trae rol y permisos actualizados. */
  renewToken(): Observable<string> {
    if (!this.renewal$) {
      this.renewal$ = this.http.post<AuthSession>(`${this.baseUrl}/renovar`, {}).pipe(
        map(session => {
          localStorage.setItem(TOKEN_KEY, session.token);
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          this._session.set(session);
          return session.token;
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => { this.renewal$ = null; })
      );
    }
    return this.renewal$;
  }

  private setSession(session: AuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._session.set(session);
    this.scheduleRenewal(session.token);
  }

  private scheduleRenewal(token: string): void {
    if (this.renewalTimer !== null) {
      clearTimeout(this.renewalTimer);
      this.renewalTimer = null;
    }
    const remainingMs = getTokenRemainingMs(token);
    const delay = remainingMs - RENEWAL_THRESHOLD_MS;
    if (delay > 0) {
      this.renewalTimer = setTimeout(() => this.performRenewal(), delay);
    } else if (remainingMs > 0) {
      this.performRenewal();
    }
  }

  private performRenewal(): void {
    this.renewToken().subscribe({
      next: newToken => this.scheduleRenewal(newToken),
      error: () => this.logout(),
    });
  }

  private loadSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      // Sesiones guardadas antes de los permisos por rol: obligan a iniciar sesión de nuevo.
      if (!Array.isArray(session.permisos)) return null;
      return isTokenValid(session.token) ? session : null;
    } catch {
      return null;
    }
  }
}

/** btoa solo acepta Latin-1: se codifica primero a UTF-8 para soportar ñ, tildes, etc. */
function toBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getTokenRemainingMs(token: string): number {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.exp * 1000 - Date.now();
  } catch {
    return 0;
  }
}
