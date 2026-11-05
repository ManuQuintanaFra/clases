import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl + '/')) return next(req);
  const auth = inject(AuthService);
  const router = inject(Router);
  const publica = ['/auth/login', '/auth/register'].some(path => req.url === environment.apiUrl + path);
  const token = publica ? null : auth.accessToken();
  const request = token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;
  return next(request).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401 && !publica && auth.accessToken() === token) {
      auth.signOut();
      void router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
