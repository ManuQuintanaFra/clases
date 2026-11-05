import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiError } from '../../core/services/api-error';
import { FavoritosService } from '../../core/services/favoritos.service';
import { Favorito } from '../../core/models/favorito.interface';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class FavoritosComponent implements OnInit {
  favoritosService = inject(FavoritosService);
  private fb = inject(FormBuilder);

  // Exponemos el signal al template
  favoritos = signal<Favorito[]>([]);
  cargando = signal(false);
  error = signal('');

  // Estado para la edición
  editandoId: string | null = null;
  notaControl = this.fb.control('', Validators.maxLength(200));

  ngOnInit() {
    this.cargarFavoritos();
  }

  cargarFavoritos() {
    this.cargando.set(true);
    this.error.set('');
    this.favoritosService.listar().subscribe({
      next: (favoritos) => {
        this.favoritos.set(favoritos);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(apiError(error));
        this.cargando.set(false);
      },
    });
  }

  eliminar(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este libro de tus favoritos?')) {
      this.favoritosService.eliminarFavorito(id).subscribe({
        next: () => this.favoritos.update((favoritos) => favoritos.filter((f) => f.id !== id)),
        error: (error) => alert(apiError(error)),
      });
    }
  }

  iniciarEdicion(fav: Favorito) {
    this.editandoId = fav.id!;
    this.notaControl.setValue(fav.nota);
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.notaControl.reset();
  }

  guardarNota(id: string) {
    if (this.notaControl.valid) {
      const nota = this.notaControl.value || '';
      this.favoritosService.actualizarNota(id, nota).subscribe({
        next: () => {
          this.favoritos.update((favoritos) =>
            favoritos.map((f) => (f.id === id ? { ...f, nota } : f)),
          );
          this.editandoId = null;
        },
        error: (error) => alert(apiError(error)),
      });
    }
  }
}
