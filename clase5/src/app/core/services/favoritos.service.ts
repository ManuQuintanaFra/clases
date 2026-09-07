import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Favorito } from '../models/favorito.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private supabase = inject(SupabaseService).client;
  private authService = inject(AuthService);

  // Estado local reactivo
  favoritos = signal<Favorito[]>([]);
  cargando = signal(false);

  // Cargar (READ) todos los favoritos del usuario actual
  async cargarFavoritos() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.cargando.set(true);
    const { data, error } = await this.supabase
      .from('favoritos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar favoritos:', error.message);
    } else {
      this.favoritos.set(data || []);
    }
    this.cargando.set(false);
  }

  // Agregar (CREATE) un nuevo libro a favoritos
  async agregarFavorito(favorito: Omit<Favorito, 'id' | 'created_at' | 'user_id'>) {
    const user = this.authService.currentUser();
    if (!user) {
        alert('Debes iniciar sesión para agregar a favoritos');
        return;
    }

    const { data, error } = await this.supabase
      .from('favoritos')
      .insert([{ ...favorito, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error al agregar favorito:', error.message);
      alert('Error al guardar el favorito.');
    } else if (data) {
      // Actualizamos el estado local
      this.favoritos.update(favs => [data, ...favs]);
      alert('¡Libro agregado a favoritos!');
    }
  }

  // Actualizar (UPDATE) la nota de un favorito
  async actualizarNota(id: string, nuevaNota: string) {
    const { data, error } = await this.supabase
      .from('favoritos')
      .update({ nota: nuevaNota })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar nota:', error.message);
      alert('Error al actualizar la nota.');
    } else if (data) {
      // Actualizamos el estado local
      this.favoritos.update(favs => 
        favs.map(f => f.id === id ? { ...f, nota: data.nota } : f)
      );
    }
  }

  // Eliminar (DELETE) un favorito
  async eliminarFavorito(id: string) {
    const { error } = await this.supabase
      .from('favoritos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar favorito:', error.message);
    } else {
      // Filtramos el eliminado del estado local
      this.favoritos.update(favs => favs.filter(f => f.id !== id));
    }
  }
}
