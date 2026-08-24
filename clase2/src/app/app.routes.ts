import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { BookDetail } from './features/book-detail/book-detail';
import { About } from './features/about/about';

export const routes: Routes = [
  // Redirección: la ruta vacía redirige a /home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Ruta padre con rutas hijas (children)
  // Home actúa como componente padre y tiene un <router-outlet> en su template
  // donde se renderizan las rutas hijas
  {
    path: 'home',
    component: Home,
    children: [
      // Ruta hija con parámetro dinámico ':id'
      // Se accede navegando a /home/book/1, /home/book/2, etc.
      // El ':id' se inyecta como input() gracias a withComponentInputBinding()
      { path: 'book/:id', component: BookDetail }
    ]
  },

  // Ruta simple
  { path: 'about', component: About },

  // Wildcard: cualquier ruta no definida redirige a /home
  { path: '**', redirectTo: '/home' }
];
