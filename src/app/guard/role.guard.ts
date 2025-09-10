import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';

export const RoleGuard: (allowedRoles: string[]) => CanActivateFn = (
  allowedRoles
) => {
  return () => {
    const router = inject(Router);
    const auth = inject(Auth);

    const role = auth.getRole();

    if (auth.isLoggedIn() && role && allowedRoles.includes(role)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
