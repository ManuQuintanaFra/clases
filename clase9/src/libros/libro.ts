export interface Libro {
  id: number;
  titulo: string;
  autor: string;
}

// El cliente envía los datos; el servidor asigna el ID.
export type CrearLibroDto = Omit<Libro, 'id'>;
export type ActualizarLibroDto = Partial<CrearLibroDto>;
