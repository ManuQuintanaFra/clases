import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Ya no necesitamos provideHttpClient() porque los libros se obtienen
    // directamente desde Supabase (no desde una API externa)
    // withComponentInputBinding() habilita que los parámetros de ruta
    // (:id, query params) se inyecten como input() en los componentes
    provideRouter(routes, withComponentInputBinding()),


    // Service Worker — se registra solo en producción
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
