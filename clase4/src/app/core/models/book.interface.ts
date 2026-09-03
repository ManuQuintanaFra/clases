export interface Book {
  id: string;
  titulo: string;
  autor: string;
  portadaUrl: string;
  disponible: boolean;
  ejemplaresRestantes: number;
  genero: string;
  anioPublicacion: number;
}