import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as Array<'student' | 'instructor' | 'admin'>;

  return authService.user$.pipe(
    map(user => {
      if (user && user.isAuthenticated && allowedRoles.includes(user.role!)) {
        return true;
      } else {
        router.navigate(['/auth']); // forbidden page later
        return false;
      }
    })
  );
};
