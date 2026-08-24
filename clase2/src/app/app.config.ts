import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding() habilita que los parámetros de ruta
    // (:id, query params) se inyecten como input() en los componentes
    provideRouter(routes, withComponentInputBinding())
  ]
};
