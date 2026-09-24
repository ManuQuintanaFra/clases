import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Book } from '../models/book.interface';
import { RealtimeChannel } from '@supabase/supabase-js';

// @Injectable({ providedIn: 'root' }) — registra el servicio como SINGLETON a nivel global
// Esto significa que hay UNA SOLA instancia compartida por toda la aplicación
@Injectable({ providedIn: 'root' })
export class BookService {
  // inject() — inyectamos el cliente de Supabase
  private supabase = inject(SupabaseService).client;
  private destroyRef = inject(DestroyRef);

  // signal() privado — solo el servicio puede modificar la lista directamente
  private librosSignal = signal<Book[]>([]);

  // signal() para indicar si los datos están cargando
  cargando = signal(false);

  // computed() de solo lectura — los componentes leen de aquí
  // Al ser computed, se actualiza automáticamente cuando librosSignal cambia
  libros = computed(() => this.librosSignal());

  // Referencia al canal de Realtime para limpieza
  private channel!: RealtimeChannel;

  constructor() {
    // Al iniciar el servicio, cargamos los libros desde Supabase
    this.cargarLibrosDesdeDB();
    // Nos suscribimos a cambios en tiempo real
    this.channel = this.iniciarRealtime();

    // Limpiamos la suscripción cuando el servicio se destruye
    this.destroyRef.onDestroy(() => {
      this.supabase.removeChannel(this.channel);
    });
  }

  // ============================================================
  // CARGAR LIBROS DESDE SUPABASE (reemplaza la API de Open Library)
  // ============================================================
  private async cargarLibrosDesdeDB(): Promise<void> {
    this.cargando.set(true);

    const { data, error } = await this.supabase
      .from('libros')
      .select('*')
      .order('titulo', { ascending: true });

    if (error) {
      console.error('❌ Error al cargar libros desde Supabase:', error.message);
    } else {
      this.librosSignal.set(data || []);
      console.log(`✅ Se cargaron ${data?.length ?? 0} libros desde Supabase`);
    }

    this.cargando.set(false);
  }

  // ============================================================
  // REALTIME — Escucha cambios en la tabla 'libros' en tiempo real
  // Cuando OTRO usuario reserva un libro, TODOS los clientes conectados
  // ven el cambio automáticamente sin recargar la página
  // ============================================================
  private iniciarRealtime(): RealtimeChannel {
    return this.supabase
      .channel('libros-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'libros' },
        (payload) => {
          console.log('🔄 Cambio en tiempo real:', payload.eventType, payload);

          switch (payload.eventType) {
            // INSERT — un nuevo libro fue agregado por otro usuario
            case 'INSERT':
              this.librosSignal.update(libros => [...libros, payload.new as Book]);
              break;

            // UPDATE — un libro fue modificado (ej: reserva que cambia el stock)
            case 'UPDATE':
              this.librosSignal.update(libros =>
                libros.map(l => l.id === (payload.new as Book).id
                  ? payload.new as Book
                  : l
                )
              );
              break;

            // DELETE — un libro fue eliminado
            case 'DELETE':
              this.librosSignal.update(libros =>
                libros.filter(l => l.id !== (payload.old as { id: string }).id)
              );
              break;
          }
        }
      )
      .subscribe();
  }

  // Obtener un libro por ID — retorna un computed que se actualiza reactivamente
  getLibroById(id: string) {
    return computed(() => this.librosSignal().find(libro => libro.id === id));
  }

  // ============================================================
  // RESERVAR LIBRO — Actualiza en Supabase (el Realtime actualiza el signal)
  // ============================================================
  async reservarLibro(id: string, nombreLector: string): Promise<boolean> {
    const libro = this.librosSignal().find(l => l.id === id);
    if (!libro || libro.ejemplares_restantes <= 0) {
      return false;
    }

    const nuevosEjemplares = libro.ejemplares_restantes - 1;

    const { error } = await this.supabase
      .from('libros')
      .update({
        ejemplares_restantes: nuevosEjemplares,
        disponible: nuevosEjemplares > 0
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error al reservar libro:', error.message);
      return false;
    }

    console.log(`📖 Reserva: ${nombreLector} reservó "${libro.titulo}"`);
    // El signal se actualiza automáticamente via Realtime
    return true;
  }

  // ============================================================
  // AGREGAR LIBRO — Inserta en Supabase (el Realtime actualiza el signal)
  // ============================================================
  async agregarLibro(libro: Omit<Book, 'id' | 'disponible'>): Promise<boolean> {
    const { error } = await this.supabase
      .from('libros')
      .insert([{
        ...libro,
        disponible: libro.ejemplares_restantes > 0
      }]);

    if (error) {
      console.error('❌ Error al agregar libro:', error.message);
      return false;
    }

    console.log(`📚 Nuevo libro agregado: "${libro.titulo}"`);
    // El signal se actualiza automáticamente via Realtime
    return true;
  }
}
