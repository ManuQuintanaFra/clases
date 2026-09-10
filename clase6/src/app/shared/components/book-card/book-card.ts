import { Component, input, output, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Book } from '../../../core/models/book.interface';
import { AnioPublicacionPipe } from '../../pipes/anio-publicacion.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { HighlightDirective } from '../../directives/highlight.directives';

@Component({
  selector: 'app-book-card',
  // ReactiveFormsModule — necesario para usar FormControl en el template
  // AnioPublicacionPipe — pipe personalizado para formatear el año de publicación
  // HighlightDirective — directiva de atributo para resaltar al hacer hover
  imports: [ReactiveFormsModule, AnioPublicacionPipe, HighlightDirective],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCard {
  authService = inject(AuthService);
  private favoritosService = inject(FavoritosService);

  // input() — recibe el libro del componente padre
  book = input.required<Book>();

  // output() — emite un evento al padre cuando se reserva un libro
  reservado = output<string>();

  // FormControl con validación — reemplaza el signal manual
  // Validators.required: el campo no puede estar vacío
  // Validators.minLength(2): mínimo 2 caracteres
  nombreControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  // Método para reservar el libro
  prestarLibro(): void {
    // Marcamos el control como touched para que muestre errores
    this.nombreControl.markAsTouched();

    // Verificamos que el formulario sea válido antes de proceder
    if (this.nombreControl.invalid) {
      return;
    }

    if (this.book().ejemplares_restantes > 0) {
      alert(`¡Reserva confirmada, ${this.nombreControl.value}! Has reservado: ${this.book().titulo}`);
      // Emitimos el evento al componente padre con el id del libro
      this.reservado.emit(this.book().id);
      // Reseteamos el formulario después de la reserva
      this.nombreControl.reset();
    }
  }

  // Método para agregar el libro a favoritos
  // Solo enviamos book_id y nota (los datos del libro se obtienen del JOIN)
  agregarAFavoritos() {
    const libro = this.book();
    this.favoritosService.agregarFavorito({
      book_id: libro.id,
      nota: ''
    });
  }
}