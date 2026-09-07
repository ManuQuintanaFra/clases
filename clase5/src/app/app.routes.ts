import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { BookDetail } from './features/book-detail/book-detail';
import { About } from './features/about/about';
import { AddBook } from './features/add-book/add-book';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { FavoritosComponent } from './features/favoritos/favoritos';
import { authGuard } from './core/guards/auth.guard';

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

  // Rutas de Auth y Favoritos
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'favoritos', 
    component: FavoritosComponent,
    canActivate: [authGuard] 
  },

  // Ruta simple
  { path: 'about', component: About },

  // Wildcard: cualquier ruta no definida redirige a /home
  { path: '**', redirectTo: '/home' }
];
