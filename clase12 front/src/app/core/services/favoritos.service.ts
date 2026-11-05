import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Favorito } from '../models/favorito.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/favoritos';

  listar() {
    return this.http.get<Favorito[]>(this.url);
  }

  agregarFavorito(favorito: Pick<Favorito, 'book_id' | 'nota'>) {
    return this.http.post<Favorito>(this.url, favorito);
  }

  actualizarNota(id: string, nota: string) {
    return this.http.patch<Favorito>(this.url + '/' + id, { nota });
  }

  eliminarFavorito(id: string) {
    return this.http.delete<void>(this.url + '/' + id);
  }
}
