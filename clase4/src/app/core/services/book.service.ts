import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book.interface';

// Interfaz que representa la respuesta de la API de Open Library
// Solo mapeamos los campos que nos interesan
interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
}

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
}

// @Injectable({ providedIn: 'root' }) — registra el servicio como SINGLETON a nivel global
// Esto significa que hay UNA SOLA instancia compartida por toda la aplicación
// Cualquier componente que lo inyecte accede a los MISMOS datos
@Injectable({ providedIn: 'root' })
export class BookService {
  // inject() — inyectamos HttpClient para hacer peticiones HTTP
  private http = inject(HttpClient);

  // URL base de la API de Open Library (gratuita, sin API key)
  private apiUrl = 'https://openlibrary.org/search.json';

  // signal() privado — solo el servicio puede modificar la lista directamente
  private librosSignal = signal<Book[]>([]);

  // signal() para indicar si los datos están cargando
  cargando = signal(false);

  // computed() de solo lectura — los componentes leen de aquí
  // Al ser computed, se actualiza automáticamente cuando librosSignal cambia
  libros = computed(() => this.librosSignal());

  constructor() {
    // Al iniciar el servicio, cargamos los libros desde la API
    this.cargarLibrosDesdeApi();
  }

  // Método que consume la API de Open Library usando HttpClient
  // subscribe() — nos suscribimos al Observable para recibir la respuesta
  cargarLibrosDesdeApi(): void {
    this.cargando.set(true);

    // http.get<T>() — hace una petición GET y tipar la respuesta
    // Los parámetros de la URL filtran por ficción en español, máximo 12 resultados
    this.http.get<OpenLibraryResponse>(this.apiUrl, {
      params: {
        q: 'ficcion',
        limit: '12',
        lang: 'es'
      }
    }).subscribe({
      // next — se ejecuta cuando la petición es exitosa
      next: (response) => {
        const libros = this.mapearRespuestaApi(response.docs);
        this.librosSignal.set(libros);
        this.cargando.set(false);
        console.log(`✅ Se cargaron ${libros.length} libros desde Open Library`);
      },
      // error — se ejecuta si la petición falla (sin red, API caída, etc.)
      // En ese caso usamos los libros hardcodeados como fallback
      error: (error) => {
        console.error('❌ Error al cargar desde la API, usando datos locales:', error);
        this.librosSignal.set(this.librosLocales());
        this.cargando.set(false);
      }
    });
  }

  // Mapea la respuesta de Open Library al formato de nuestra interfaz Book
  private mapearRespuestaApi(docs: OpenLibraryBook[]): Book[] {
    return docs
      .filter(doc => doc.title && doc.author_name?.length) // Filtramos libros sin datos
      .map(doc => ({
        id: doc.key,
        titulo: doc.title,
        autor: doc.author_name![0], // Tomamos el primer autor
        // Open Library provee portadas por cover_i: https://covers.openlibrary.org/b/id/{cover_i}-M.jpg
        portadaUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : 'https://via.placeholder.com/200x300?text=Sin+Portada',
        disponible: true,
        ejemplaresRestantes: Math.floor(Math.random() * 5) + 1, // Simulamos stock aleatorio (1-5)
        genero: doc.subject?.[0] ?? 'General',
        anioPublicacion: doc.first_publish_year ?? 0
      }));
  }

  // Libros hardcodeados como fallback en caso de error de la API
  private librosLocales(): Book[] {
    return [
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
  }

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
