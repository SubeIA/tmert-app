import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authService.currentUser();
  if (!currentUser || !currentUser.role) {
    return router.createUrlTree(['/home']);
  }

  const hasRole = requiredRoles.includes(currentUser.role);
  if (hasRole) {
    return true;
  }

  return router.createUrlTree(['/home']);
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const currentUser = authService.currentUser();
  if (currentUser?.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/home']);
};

export const evaluatorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const currentUser = authService.currentUser();

  const allowedRoles = ['admin', 'evaluator'];

  if (currentUser?.role && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
