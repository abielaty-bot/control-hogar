import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

// Interceptor: agrega el encabezado Authorization (Basic) a cada
// peticion saliente, salvo cuando la peticion ya lo trae (el login).
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (token && !req.headers.has('Authorization')) {
    req = req.clone({
      setHeaders: { Authorization: `Basic ${token}` }
    });
  }

  return next(req);
};
