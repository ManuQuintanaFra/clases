// Libro devuelto por la API Nest
// Los nombres usan snake_case para coincidir con las columnas de la DB
export interface Book {
  id: string;
  titulo: string;
  autor: string;
  portada_url: string;
  disponible: boolean;
  ejemplares_restantes: number;
  genero: string;
  aniopublicacion: number;
}