import { AnioPublicacionPipe } from './anio-publicacion.pipe';

describe('AnioPublicacionPipe', () => {
  let pipe: AnioPublicacionPipe;

  beforeEach(() => {
    pipe = new AnioPublicacionPipe();
  });

  it('debería crear una instancia del pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('debería retornar "Este año (XXXX)" cuando el año es el actual', () => {
    const anioActual = new Date().getFullYear();
    const resultado = pipe.transform(anioActual);
    expect(resultado).toBe(`Este año (${anioActual})`);
  });

  it('debería retornar "Este año" cuando el año es futuro', () => {
    const anioFuturo = new Date().getFullYear() + 5;
    const resultado = pipe.transform(anioFuturo);
    expect(resultado).toBe(`Este año (${anioFuturo})`);
  });

  it('debería retornar "Hace 1 año (XXXX)" cuando la diferencia es 1', () => {
    const anioAnterior = new Date().getFullYear() - 1;
    const resultado = pipe.transform(anioAnterior);
    expect(resultado).toBe(`Hace 1 año (${anioAnterior})`);
  });

  it('debería retornar "Hace N años (XXXX)" cuando la diferencia es mayor a 1', () => {
    const anioActual = new Date().getFullYear();
    const anio = anioActual - 10;
    const resultado = pipe.transform(anio);
    expect(resultado).toBe(`Hace 10 años (${anio})`);
  });

  it('debería manejar años muy antiguos correctamente', () => {
    const anioActual = new Date().getFullYear();
    const diferencia = anioActual - 1900;
    const resultado = pipe.transform(1900);
    expect(resultado).toBe(`Hace ${diferencia} años (1900)`);
  });

  it('debería retornar "Hace 2 años" para exactamente 2 años atrás', () => {
    const anio = new Date().getFullYear() - 2;
    const resultado = pipe.transform(anio);
    expect(resultado).toBe(`Hace 2 años (${anio})`);
  });
});
