import { Component } from '@angular/core';
import { Book } from '../../../core/models/book.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-card',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCard {
nombreLector!: string;
book: Book = {
    id: '1',
    titulo: '1984',
    autor: 'George Orwell',
    portadaUrl: 'https://m.media-amazon.com/images/I/61ZewDE3beL._AC_UF1000,1000_QL80_.jpg',
    disponible: true,
    ejemplaresRestantes: 2
  };

  // Actualizamos la función para recibir el nombre del lector
  prestarLibro(nombreLector: string): void {
    if (!nombreLector) {
      alert('Por favor, ingresa tu nombre para reservar el libro.');
      return;
    }

    if (this.book.ejemplaresRestantes > 0) {
      this.book.ejemplaresRestantes--;
      // Mostramos un mensaje personalizado con el nombre ingresado
      alert(`¡Reserva confirmada, ${nombreLector}! Has reservado: ${this.book.titulo}`);
      console.log(`Reserva realizada por: ${nombreLector} - Libro: ${this.book.titulo}`);
    }
    
    if (this.book.ejemplaresRestantes === 0) {
      this.book.disponible = false;
    }
  }
}