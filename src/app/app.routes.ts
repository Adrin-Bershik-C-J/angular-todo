import { Routes } from '@angular/router';
import { Login } from './page/login/login';
import { Register } from './page/register/register';
import { Todo } from './page/todo/todo';
import { AuthGuard } from './guard/auth.guard';
import { GuestGuard } from './guard/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
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
    path: 'todo',
    component: Todo,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: Login,
  },
];
