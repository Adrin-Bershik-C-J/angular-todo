import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';

export const RoleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const auth = inject(Auth);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = auth.getRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case 'ADMIN':
        router.navigate(['/dashboard/admin']);
        break;
      case 'MANAGER':
        router.navigate(['/dashboard/manager']);
        break;
      case 'TL':
        router.navigate(['/dashboard/tl']);
        break;
      case 'MEMBER':
        router.navigate(['/dashboard/member']);
        break;
      default:
        router.navigate(['/unauthorized']);
    }
    
    return false;
  };
};