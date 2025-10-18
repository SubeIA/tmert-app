import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  // Future: Register component
  // {
  //   path: 'register',
  //   loadComponent: () =>
  //     import('./register/register.component').then((m) => m.RegisterComponent),
  // },
  // Future: Forgot password component
  // {
  //   path: 'forgot-password',
  //   loadComponent: () =>
  //     import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  // },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
