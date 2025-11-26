import { Routes } from '@angular/router';

export const TMERT_EVALUATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tmert-evaluation.component').then(m => m.TmertEvaluationComponent),
  },
];
