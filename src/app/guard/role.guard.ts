import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';

export const RoleGuard: CanActivateFn = (expectedRole: string) => {
  const router = inject(Router);
  const auth = inject(Auth);
  const role = auth.getRole();
  if (auth.isLoggedIn() && role === expectedRole) return true;
  router.navigate(['/unauthorized']);
  return false;
};
