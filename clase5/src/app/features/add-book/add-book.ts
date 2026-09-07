import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-add-book',
  // ReactiveFormsModule — necesario para usar FormGroup y FormControl en el template
  imports: [ReactiveFormsModule],
  templateUrl: './add-book.html',
  styleUrl: './add-book.css'
})
export class AddBook {
  // inject() — inyectamos el servicio y el router
  private bookService = inject(BookService);
  private router = inject(Router);

  // Géneros disponibles para el select
  generos = ['Novela', 'Distopía', 'Fábula', 'Realismo Mágico', 'Ciencia Ficción', 'Terror', 'Poesía', 'Ensayo', 'Historia'];

  // FormGroup — agrupa múltiples FormControls en un solo formulario
  // Cada FormControl tiene su valor inicial y sus validadores
  libroForm = new FormGroup({
    // Validators.required: campo obligatorio
    // Validators.minLength(2): mínimo 2 caracteres
    // Validators.maxLength(100): máximo 100 caracteres
    titulo: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]),

    autor: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),

    genero: new FormControl('', [
      Validators.required
    ]),

    // Validators.min / .max: valor numérico mínimo y máximo
    anioPublicacion: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1000),
      Validators.max(new Date().getFullYear())
    ]),

    ejemplaresRestantes: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(99)
    ]),

    // Validators.pattern: valida contra una expresión regular
    portadaUrl: new FormControl('', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/)
    ])
  });

  // Método auxiliar para acceder a los controles del formulario fácilmente
  get f() {
    return this.libroForm.controls;
  }

  // Submit del formulario
  onSubmit(): void {
    // Marcamos todos los controles como touched para mostrar todos los errores
    this.libroForm.markAllAsTouched();

    // Si el formulario es inválido, no hacemos nada
    if (this.libroForm.invalid) {
      return;
    }

    // Obtenemos los valores del formulario
    const formValue = this.libroForm.getRawValue();

    // Agregamos el libro al servicio
    this.bookService.agregarLibro({
      titulo: formValue.titulo!,
      autor: formValue.autor!,
      genero: formValue.genero!,
      anioPublicacion: formValue.anioPublicacion!,
      ejemplaresRestantes: formValue.ejemplaresRestantes!,
      portadaUrl: formValue.portadaUrl!
    });

    // Navegamos al catálogo para ver el nuevo libro
    alert(`✅ Libro "${formValue.titulo}" agregado exitosamente!`);
    this.router.navigate(['/home']);
  }
}
