import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;

  if (!req.url.startsWith(`${apiUrl}/`)) {
    return next(req);
  }

  const publica = ['/auth/login', '/auth/register'].some(
    path => req.url === `${apiUrl}${path}`
  );

  if (publica) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.accessToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        auth.accessToken() === token
      ) {
        auth.signOut();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};