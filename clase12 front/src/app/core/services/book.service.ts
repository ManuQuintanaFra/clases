import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/libros';
  libros = signal<Book[]>([]);

  listar() {
    return this.http.get<Book[]>(this.url);
  }

  reservarLibro(id: string) {
    return this.http.post<Book>(this.url + '/' + id + '/reservar', {});
  }

  agregarLibro(libro: Omit<Book, 'id' | 'disponible'>) {
    return this.http.post<Book>(this.url, libro);
  }
}
