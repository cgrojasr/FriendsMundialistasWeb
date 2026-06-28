import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('Authorization') || !environment.authBearerToken) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${environment.authBearerToken}`,
    },
  });

  return next(authenticatedRequest);
};