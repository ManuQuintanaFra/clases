import { Component, input, output, signal } from '@angular/core';
import { Book } from '../../../core/models/book.interface';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCard {
  // input() — recibe el libro del componente padre
  book = input.required<Book>();

  // output() — emite un evento al padre cuando se reserva un libro
  reservado = output<string>();

  // signal() — estado local mutable para el nombre del lector
  nombreLector = signal('');

  // Método para reservar el libro
  prestarLibro(): void {
    if (!this.nombreLector()) {
      alert('Por favor, ingresa tu nombre para reservar el libro.');
      return;
    }

    if (this.book().ejemplaresRestantes > 0) {
      alert(`¡Reserva confirmada, ${this.nombreLector()}! Has reservado: ${this.book().titulo}`);
      // Emitimos el evento al componente padre con el id del libro
      this.reservado.emit(this.book().id);
    }
  }

  // Actualiza el signal del nombre desde el input del template
  actualizarNombre(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nombreLector.set(input.value);
  }
}