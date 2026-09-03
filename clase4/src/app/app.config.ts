import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
// provideHttpClient — habilita HttpClient para hacer peticiones HTTP (GET, POST, etc.)
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient() — registra HttpClient como servicio inyectable en toda la app
    provideHttpClient(),
    // withComponentInputBinding() habilita que los parámetros de ruta
    // (:id, query params) se inyecten como input() en los componentes
    provideRouter(routes, withComponentInputBinding())
  ]
};
