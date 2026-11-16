import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ServiceUnavailableException } from '@nestjs/common';
import { finalize, Observable } from 'rxjs';

@Injectable()
export class PortadasInterceptor implements NestInterceptor {
  private activas = 0
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
   if(this.activas >= 4){
    throw new ServiceUnavailableException('Demasiadas subidas simultaneas, intentar mas tarde')
   }
   this.activas++;

    return next.handle().pipe(finalize(()=>{
      this.activas--;
    }));
  }
}
