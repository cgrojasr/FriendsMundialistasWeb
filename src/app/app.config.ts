import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { equipoApiInterceptor } from './core/mocks/equipo-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor, equipoApiInterceptor])),
  ]
};
