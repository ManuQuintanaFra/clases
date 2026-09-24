import { Book } from './book.interface';

// Interface que mapea la tabla 'favoritos' de Supabase
// La propiedad 'libros' se obtiene del JOIN con la tabla libros
export interface Favorito {
  id?: string;
  user_id?: string;
  book_id: string;
  nota: string;
  // Objeto del libro obtenido via JOIN: .select('*, libros(*)')
  libros?: Book;
}
