import { inject } from '@angular/core';
import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { EMPTY, catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService, getTokenRemainingMs, RENEWAL_THRESHOLD_MS } from '../auth.service';
import { environment } from '../../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const handleError = (error: unknown): Observable<never> => {
    const status = (error as { status?: number }).status;
    const localToken = auth.getToken();
    const localExpired = !localToken || getTokenRemainingMs(localToken) <= 0;
    if (status === 401 || (status === 403 && localExpired)) {
      auth.logout();
      return EMPTY;
    }
    return throwError(() => error);
  };

  const proceed = (token: string | null): Observable<HttpEvent<unknown>> => {
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(authReq).pipe(catchError(handleError));
  };

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  if (req.url.includes('/auth/login') || req.url.includes('/auth/renovar')) {
    return next(req).pipe(catchError(handleError));
  }

  const token = auth.getToken();
  const remainingMs = token ? getTokenRemainingMs(token) : 0;

  if (token && remainingMs <= 0) {
    auth.logout();
    return EMPTY;
  }

  if (token && remainingMs <= RENEWAL_THRESHOLD_MS) {
    return auth.renewToken().pipe(
      switchMap(newToken => proceed(newToken)),
      catchError(handleError)
    );
  }

  return proceed(token);
};
