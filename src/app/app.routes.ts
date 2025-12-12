import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard, evaluatorGuard } from '@core/guards/role.guard';

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
        path: 'companies',
        data: { breadcrumb: 'Empresas' },
        loadComponent: () =>
          import('@features/companies/companies.component').then(m => m.CompaniesComponent),
      },
      {
        path: 'companies/:id/assign-evaluators',
        data: { breadcrumb: 'Asignar Evaluadores' },
        loadComponent: () =>
          import('@features/companies/assign-evaluators/assign-evaluators.component').then(
            m => m.AssignEvaluatorsComponent
          ),
      },
      {
        path: 'users',
        data: { breadcrumb: 'Usuarios', roles: ['admin'] },
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('@features/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'evaluations',
        data: { breadcrumb: 'Evaluaciones' },
        loadComponent: () =>
          import('@features/evaluations/evaluations.component').then(m => m.EvaluationsComponent),
      },
      {
        path: 'tmert-evaluation',
        data: { breadcrumb: 'Evaluación TMERT' },
        canActivate: [authGuard, evaluatorGuard],
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
