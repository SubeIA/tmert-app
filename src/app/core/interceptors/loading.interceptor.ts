import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@core/services/loading.service';

// URLs que no deben mostrar el loading global
const EXCLUDED_URLS = [
  '/api/v1/tmert/threads',
  '/api/v1/tmert/messages',
  '/api/v1/tmert/runs',
  '/api/v1/tmert/chat',
];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // No mostrar loading para peticiones del chat
  const isExcluded = EXCLUDED_URLS.some(url => req.url.includes(url));

  if (!isExcluded) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!isExcluded) {
        loadingService.hide();
      }
    })
  );
};
