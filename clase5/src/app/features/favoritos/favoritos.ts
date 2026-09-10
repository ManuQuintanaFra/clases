import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FavoritosService } from '../../core/services/favoritos.service';
import { Favorito } from '../../core/models/favorito.interface';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './favoritos.html',
  styleUrl : './favoritos.css'
})
export class FavoritosComponent implements OnInit {
  favoritosService = inject(FavoritosService);
  private fb = inject(FormBuilder);
  
  // Exponemos el signal al template
  favoritos = this.favoritosService.favoritos;

  // Estado para la edición
  editandoId: string | null = null;
  notaControl = this.fb.control('', Validators.maxLength(200));

  ngOnInit() {
    this.favoritosService.cargarFavoritos();
  }

  eliminar(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este libro de tus favoritos?')) {
      this.favoritosService.eliminarFavorito(id);
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

  async guardarNota(id: string) {
    if (this.notaControl.valid) {
      await this.favoritosService.actualizarNota(id, this.notaControl.value || '');
      this.editandoId = null;
    }
  }
}
