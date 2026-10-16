import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

// Guard de rutas: sin sesion iniciada, todo va al login.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
