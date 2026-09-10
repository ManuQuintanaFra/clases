import { Routes } from '@angular/router';
// import { Home } from './features/home/home';
// import { BookDetail } from './features/book-detail/book-detail';
import { About } from './features/about/about';
// import { AddBook } from './features/add-book/add-book';
// import { LoginComponent } from './features/auth/login/login';
// import { RegisterComponent } from './features/auth/register/register';
// import { FavoritosComponent } from './features/favoritos/favoritos';
import { authGuard } from './core/guards/auth.guard';
import { authAdminGuard } from './core/guards/auth-admin-guard';

export const routes: Routes = [
  // Redirección: la ruta vacía redirige a /home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Ruta padre con rutas hijas (children)
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(c => c.Home),
    children: [
      // Ruta hija con parámetro dinámico ':id'
      { path: 'book/:id', 
        loadComponent: () => import('./features/book-detail/book-detail').then(c => c.BookDetail)
      }
    ]
  },
  // Ruta para agregar un nuevo libro
  { path: 'add-book',
    loadComponent: () => import('./features/add-book/add-book').then(c => c.AddBook)
   },

  // Rutas de Auth y Favoritos
  { path: 'login',
     loadComponent: () => import('./features/auth/login/login').then(c => c.LoginComponent)
   },
  { path: 'register', 
     loadComponent: () => import('./features/auth/register/register').then(c => c.RegisterComponent)
   },
  { 
    path: 'favoritos', 
    loadComponent: () => import('./features/favoritos/favoritos').then(c => c.FavoritosComponent),
    canActivate: [authGuard] 
  },
  // Ruta simple
  { path: 'about', component: About ,
    canActivate: [authAdminGuard]
  },

  // Wildcard: cualquier ruta no definida redirige a /home
  { path: '**', redirectTo: '/home' }
];
