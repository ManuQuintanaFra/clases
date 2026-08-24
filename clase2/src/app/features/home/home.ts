import { Component, signal, computed, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Book } from '../../core/models/book.interface';
import { BookCard } from '../../shared/components/book-card/book-card';
import { SearchBar } from '../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-home',
  // RouterOutlet se necesita para renderizar las rutas hijas (children)
  imports: [BookCard, SearchBar, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // signal() — estado mutable: lista de libros hardcodeada (sin servicios)
  libros = signal<Book[]>([
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
  ]);

  // signal() — estado mutable para el filtro de búsqueda
  filtroBusqueda = signal('');

  // computed() — estado derivado: filtra los libros según el término de búsqueda
  // Se recalcula automáticamente cuando cambia filtroBusqueda o libros
  librosFiltrados = computed(() => {
    const termino = this.filtroBusqueda().toLowerCase();
    if (!termino) {
      return this.libros();
    }
    return this.libros().filter(libro =>
      libro.titulo.toLowerCase().includes(termino) ||
      libro.autor.toLowerCase().includes(termino)
    );
  });

  // Inyección del Router para navegación programática
  constructor(private router: Router) {
    // effect() — ejecuta un efecto secundario cada vez que cambian los signals que lee
    // Útil para logging, debugging, o sincronización
    effect(() => {
      console.log(`📚 Filtro activo: "${this.filtroBusqueda()}" → ${this.librosFiltrados().length} resultados`);
    });
  }

  // Maneja el output() del BookCard cuando se reserva un libro
  onLibroReservado(libroId: string): void {
    // Actualizamos el signal con una nueva copia del array (inmutabilidad)
    this.libros.update(libros =>
      libros.map(libro => {
        if (libro.id === libroId && libro.ejemplaresRestantes > 0) {
          const nuevosEjemplares = libro.ejemplaresRestantes - 1;
          return {
            ...libro,
            ejemplaresRestantes: nuevosEjemplares,
            disponible: nuevosEjemplares > 0
          };
        }
        return libro;
      })
    );
  }

  // Navegación programática con Router.navigate()
  // Navega a la ruta hija: /home/book/:id
  verDetalle(libroId: string): void {
    this.router.navigate(['/home/book', libroId]);
  }
}
