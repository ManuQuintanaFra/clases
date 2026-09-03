import { Pipe, PipeTransform } from '@angular/core';

// @Pipe — define un pipe personalizado que se usa en templates con el operador |
// name: 'anioPublicacion' → se usa como {{ valor | anioPublicacion }}
@Pipe({
  name: 'anioPublicacion',
})
export class AnioPublicacionPipe implements PipeTransform {
  // transform() — método obligatorio que recibe el valor y retorna el resultado transformado
  // Angular lo llama automáticamente cada vez que el valor cambia
  transform(anio: number): string {
    const anioActual = new Date().getFullYear();
    const diferencia = anioActual - anio;

    if (diferencia <= 0) {
      return `Este año (${anio})`;
    } else if (diferencia === 1) {
      return `Hace 1 año (${anio})`;
    } else {
      return `Hace ${diferencia} años (${anio})`;
    }
  }
}
