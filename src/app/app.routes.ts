import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        data: { breadcrumb: 'Dashboard' },
        loadComponent: () => import('@features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'users',
        data: { breadcrumb: 'Users' },
        loadComponent: () => import('@features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'tmert-evaluation',
        data: { breadcrumb: 'Evaluación TMERT' },
        loadChildren: () =>
          import('@features/tmert-evaluation/tmert-evaluation.routes').then(
            m => m.TMERT_EVALUATION_ROUTES
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
