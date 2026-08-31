import { Component, input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail {
  // input() de ruta — gracias a withComponentInputBinding(), Angular inyecta
  // el parámetro ':id' de la URL directamente como un input del componente
  id = input.required<string>();

  // inject() — inyectamos el servicio para obtener los datos actualizados
  private bookService = inject(BookService);
  private router = inject(Router);

  // computed() — obtiene el libro del servicio reactivamente
  // Como BookService usa signals, este computed se actualiza automáticamente
  // cuando los datos del servicio cambian (ej: después de una reserva)
  libro = computed(() => {
    const todosLosLibros = this.bookService.libros();
    return todosLosLibros.find(l => l.id === this.id());
  });

  // computed() para determinar el estado del stock (usado con @switch en el template)
  estadoStock = computed(() => {
    const book = this.libro();
    if (!book) return 'not-found';
    return book.ejemplaresRestantes;
  });

  // Navegación programática — volver al listado
  volver(): void {
    this.router.navigate(['/home']);
  }
}
