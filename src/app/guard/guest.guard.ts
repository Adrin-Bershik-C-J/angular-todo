import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';

export const GuestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return true;
  }
  const userRole = auth.getRole();
  if (userRole === 'ADMIN') {
    router.navigate(['/dashboard/admin']);
  } else if (userRole === 'MANAGER') {
    router.navigate(['/dashboard/manager']);
  } else if (userRole === 'TL') {
    router.navigate(['/dashboard/tl']);
  } else {
    router.navigate(['/dashboard/member']);
  }
  return false;
};
