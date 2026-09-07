import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FavoritosService } from '../../core/services/favoritos.service';
import { Favorito } from '../../core/models/favorito.interface';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="favoritos-container">
      <h2>⭐ Mis Libros Favoritos</h2>
      
      @if (favoritosService.cargando()) {
        <p>Cargando favoritos...</p>
      } @else if (favoritos().length === 0) {
        <p class="empty-state">No tienes libros favoritos aún. ¡Busca en el catálogo y agrega algunos!</p>
      } @else {
        <div class="favoritos-grid">
          @for (fav of favoritos(); track fav.id) {
            <div class="favorito-card">
              <img [src]="fav.cover_url" [alt]="fav.book_title" class="cover">
              <div class="info">
                <h3>{{ fav.book_title }}</h3>
                
                <!-- Modo visualización de nota -->
                @if (editandoId !== fav.id) {
                  <p class="nota"><strong>Mi nota:</strong> {{ fav.nota || 'Sin notas.' }}</p>
                  <div class="actions">
                    <button class="btn-edit" (click)="iniciarEdicion(fav)">✏️ Editar Nota</button>
                    <button class="btn-delete" (click)="eliminar(fav.id!)">🗑️ Eliminar</button>
                  </div>
                } 
                <!-- Modo edición de nota -->
                @else {
                  <div class="edit-nota-form">
                    <input type="text" [formControl]="notaControl" placeholder="Escribe algo sobre este libro...">
                    <div class="actions">
                      <button class="btn-save" (click)="guardarNota(fav.id!)" [disabled]="notaControl.invalid">💾 Guardar</button>
                      <button class="btn-cancel" (click)="cancelarEdicion()">❌ Cancelar</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .favoritos-container { padding: 20px; }
    h2 { color: #333; margin-bottom: 20px; }
    .empty-state { color: #666; font-style: italic; }
    .favoritos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .favorito-card { display: flex; gap: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .cover { width: 80px; height: 120px; object-fit: cover; border-radius: 4px; }
    .info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    h3 { margin: 0 0 10px 0; font-size: 1.1em; }
    .nota { font-size: 0.9em; color: #555; background: #f9f9f9; padding: 8px; border-radius: 4px; border-left: 3px solid #f0ad4e; }
    .actions { display: flex; gap: 8px; margin-top: 10px; }
    button { border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em; font-weight: bold; }
    .btn-edit { background-color: #f0ad4e; color: white; }
    .btn-delete { background-color: #d9534f; color: white; }
    .btn-save { background-color: #5cb85c; color: white; }
    .btn-cancel { background-color: #ccc; color: #333; }
    .edit-nota-form input { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px; }
  `]
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
