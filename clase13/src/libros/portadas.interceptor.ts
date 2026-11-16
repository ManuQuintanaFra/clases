import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
} from '@nestjs/common';
import { finalize } from 'rxjs';

// Se ejecuta antes de Multer: acota buffers y decodificaciones por proceso.
@Injectable()
export class PortadasInterceptor implements NestInterceptor {
  // Cuenta peticiones en curso en esta instancia compartida del interceptor.
 
  private activas = 0;

  // _context contiene información de la petición, pero aquí no la necesitamos.
 
  intercept(_context: ExecutionContext, next: CallHandler) {
   
    if (this.activas >= 4)
      throw new ServiceUnavailableException(
        'Demasiadas subidas simultáneas; reintentá más tarde',
      );
    // Reserva un lugar hasta que termine el procesamiento de esta petición.
    // Como se aplica al POST completo, también cuenta altas sin archivo.
    this.activas++;
    // next.handle() devuelve un Observable de RxJS. pipe agrega operaciones.
    // finalize libera el lugar cuando el Observable termina, falla o se cancela
    // su suscripción. No implica cancelar automáticamente una subida externa.
    return next.handle().pipe(finalize(() => this.activas--));
  }
}
