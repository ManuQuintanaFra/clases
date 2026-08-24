import { Component, input, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Book } from '../../core/models/book.interface';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail {
  // input() de ruta — gracias a withComponentInputBinding(), Angular inyecta
  // el parámetro ':id' de la URL directamente como un input del componente
  id = input.required<string>();

  // signal() para almacenar el libro encontrado
  libro = signal<Book | undefined>(undefined);

  // Lista hardcodeada (sin servicios, se repite aquí por motivos didácticos)
  private libros: Book[] = [
    {
      id: '1',
      titulo: '1984',
      autor: 'George Orwell',
      portadaUrl: 'https://m.media-amazon.com/images/I/61ZewDE3beL._AC_UF1000,1000_QL80_.jpg',
      disponible: true,
      ejemplaresRestantes: 2,
      genero: 'Distopía',
      anioPublicacion: 1949
    },
    {
      id: '2',
      titulo: 'Cien Años de Soledad',
      autor: 'Gabriel García Márquez',
      portadaUrl: 'https://m.media-amazon.com/images/I/91TvVQxAHgL._AC_UF1000,1000_QL80_.jpg',
      disponible: true,
      ejemplaresRestantes: 3,
      genero: 'Realismo Mágico',
      anioPublicacion: 1967
    },
    {
      id: '3',
      titulo: 'El Principito',
      autor: 'Antoine de Saint-Exupéry',
      portadaUrl: 'https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg',
      disponible: true,
      ejemplaresRestantes: 1,
      genero: 'Fábula',
      anioPublicacion: 1943
    },
    {
      id: '4',
      titulo: 'Don Quijote de la Mancha',
      autor: 'Miguel de Cervantes',
      portadaUrl: 'https://m.media-amazon.com/images/I/91sJSMn+VTL._AC_UF1000,1000_QL80_.jpg',
      disponible: false,
      ejemplaresRestantes: 0,
      genero: 'Novela',
      anioPublicacion: 1605
    }
  ];

  constructor(private router: Router) {
    // effect() — busca el libro cuando el input 'id' cambia
    effect(() => {
      const libroEncontrado = this.libros.find(l => l.id === this.id());
      this.libro.set(libroEncontrado);
    });
  }

  // Navegación programática — volver al listado
  volver(): void {
    this.router.navigate(['/home']);
  }
}
