import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { Register } from './page/register/register';
import { Todo } from './page/todo/todo';
import { ManagerDashboard } from './page/manager-dashboard/manager-dashboard';
import { TlDashboard } from './page/tl-dashboard/tl-dashboard';
import { AdminDashboard } from './page/admin-dashboard/admin-dashboard';
import { MemberDashboard } from './page/member-dashboard/member-dashboard';
import { AuthGuard } from './guard/auth.guard';
import { GuestGuard } from './guard/guest.guard';
import { RoleGuard } from './guard/role.guard';
import { UnauthorizedComponent } from './page/unauthorized';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [GuestGuard],
  },
  {
    path: 'dashboard',
    redirectTo: '/dashboard/member',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/admin',
    component: AdminDashboard,
    canActivate: [AuthGuard, RoleGuard(['ADMIN'])],
  },
  {
    path: 'dashboard/manager',
    component: ManagerDashboard,
    canActivate: [AuthGuard, RoleGuard(['MANAGER'])],
  },
  {
    path: 'dashboard/tl',
    component: TlDashboard,
    canActivate: [AuthGuard, RoleGuard(['TL'])],
  },
  {
    path: 'dashboard/member',
    component: MemberDashboard,
    canActivate: [AuthGuard, RoleGuard(['MEMBER'])],
  },
  {
    path: 'todo',
    component: Todo,
    canActivate: [AuthGuard],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];