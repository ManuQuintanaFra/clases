import { Component, signal, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BookCard } from '../../shared/components/book-card/book-card';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-home',
  // RouterOutlet se necesita para renderizar las rutas hijas (children)
  imports: [BookCard, SearchBar, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // inject() — forma moderna de inyectar dependencias (alternativa al constructor)
  private bookService = inject(BookService);
  private router = inject(Router);

  // Los libros ahora vienen del SERVICIO (fuente única de verdad)
  // Ya no se duplican los datos en cada componente
  libros = this.bookService.libros;

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

  constructor() {
    // effect() — ejecuta un efecto secundario cada vez que cambian los signals que lee
    effect(() => {
      console.log(`📚 Filtro activo: "${this.filtroBusqueda()}" → ${this.librosFiltrados().length} resultados`);
    });
  }

  // Maneja el output() del BookCard cuando se reserva un libro
  // Ahora delega al servicio en lugar de manejar el estado localmente
  onLibroReservado(libroId: string): void {
    // El servicio se encarga de actualizar el estado
    // Como es un signal compartido, BookDetail también verá el cambio
    this.bookService.reservarLibro(libroId, 'Usuario');
  }

  // Navegación programática con Router.navigate()
  // Navega a la ruta hija: /home/book/:id
  verDetalle(libroId: string): void {
    this.router.navigate(['/home/book', libroId]);
  }
}
