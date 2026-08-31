import { Injectable, signal, computed } from '@angular/core';
import { Book } from '../models/book.interface';

// @Injectable({ providedIn: 'root' }) — registra el servicio como SINGLETON a nivel global
// Esto significa que hay UNA SOLA instancia compartida por toda la aplicación
// Cualquier componente que lo inyecte accede a los MISMOS datos
@Injectable({ providedIn: 'root' })
export class BookService {
  // signal() privado — solo el servicio puede modificar la lista directamente
  private librosSignal = signal<Book[]>([
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

  // computed() de solo lectura — los componentes leen de aquí
  // Al ser computed, se actualiza automáticamente cuando librosSignal cambia
  libros = computed(() => this.librosSignal());

  // Obtener un libro por ID — retorna un computed que se actualiza reactivamente
  getLibroById(id: string) {
    return computed(() => this.librosSignal().find(libro => libro.id === id));
  }

  // Reservar un libro — actualiza el signal de forma inmutable
  // Retorna true si la reserva fue exitosa
  reservarLibro(id: string, nombreLector: string): boolean {
    const libro = this.librosSignal().find(l => l.id === id);
    if (!libro || libro.ejemplaresRestantes <= 0) {
      return false;
    }

    this.librosSignal.update(libros =>
      libros.map(l => {
        if (l.id === id) {
          const nuevosEjemplares = l.ejemplaresRestantes - 1;
          return {
            ...l,
            ejemplaresRestantes: nuevosEjemplares,
            disponible: nuevosEjemplares > 0
          };
        }
        return l;
      })
    );

    console.log(`📖 Reserva: ${nombreLector} reservó "${libro.titulo}"`);
    return true;
  }

  // Agregar un nuevo libro al catálogo
  agregarLibro(libro: Omit<Book, 'id' | 'disponible'>): void {
    const nuevoLibro: Book = {
      ...libro,
      id: crypto.randomUUID(),
      disponible: libro.ejemplaresRestantes > 0
    };

    this.librosSignal.update(libros => [...libros, nuevoLibro]);
    console.log(`📚 Nuevo libro agregado: "${nuevoLibro.titulo}"`);
  }
}
