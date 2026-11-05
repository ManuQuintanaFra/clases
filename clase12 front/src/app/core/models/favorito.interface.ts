import { Book } from './book.interface';

// Favorito del usuario autenticado
// La API incluye el libro asociado si todavía existe
export interface Favorito {
  id?: string;
  user_id?: string;
  book_id: string;
  nota: string;
  // Libro asociado
  libros?: Book | null;
}
