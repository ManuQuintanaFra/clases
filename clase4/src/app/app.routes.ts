import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { BookDetail } from './features/book-detail/book-detail';
import { About } from './features/about/about';
import { AddBook } from './features/add-book/add-book';

export const routes: Routes = [
  // Redirección: la ruta vacía redirige a /home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Ruta padre con rutas hijas (children)
  {
    path: 'home',
    component: Home,
    children: [
      // Ruta hija con parámetro dinámico ':id'
      { path: 'book/:id', component: BookDetail }
    ]
  },

  // Ruta para agregar un nuevo libro
  { path: 'add-book', component: AddBook },

  // Ruta simple
  { path: 'about', component: About },

  // Wildcard: cualquier ruta no definida redirige a /home
  { path: '**', redirectTo: '/home' }
];
