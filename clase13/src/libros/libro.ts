export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  portada_url: string;
  genero: string;
  aniopublicacion: number;
  ejemplares_restantes: number;
  disponible: boolean;
}
