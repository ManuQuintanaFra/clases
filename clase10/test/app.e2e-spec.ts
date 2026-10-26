import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { LibrosController } from '../src/libros/libros.controller';
import { LibrosService } from '../src/libros/libros.service';
import { LibroMongo } from '../src/libros/libro.schema';

type Registro = LibroMongo & { _id: Types.ObjectId };

// Doble de persistencia: prueba HTTP, DTOs y servicio sin requerir Mongo local.
function crearModeloDePrueba() {
  const registros = new Map<string, Registro>();
  const consulta = <T>(valor: T) => ({ exec: () => Promise.resolve(valor) });
  return {
    create: (datos: LibroMongo) => {
      const libro = { ...datos, _id: new Types.ObjectId() };
      registros.set(libro._id.toString(), libro);
      return Promise.resolve(libro);
    },
    find: () => ({
      sort: () =>
        consulta(
          [...registros.values()].sort((a, b) =>
            a.titulo.localeCompare(b.titulo),
          ),
        ),
    }),
    findById: (id: string) => consulta(registros.get(id) ?? null),
    findByIdAndUpdate: (id: string, cambio: { $set: Partial<LibroMongo> }) => {
      const libro = registros.get(id);
      if (libro) Object.assign(libro, cambio.$set);
      return consulta(libro ?? null);
    },
    findByIdAndDelete: (id: string) => {
      const libro = registros.get(id);
      registros.delete(id);
      return consulta(libro ?? null);
    },
    findOneAndUpdate: (
      filtro: { _id: string; ejemplares_restantes: { $gt: number } },
      cambio: { $inc: { ejemplares_restantes: number } },
    ) => {
      const libro = registros.get(filtro._id);
      if (
        !libro ||
        libro.ejemplares_restantes <= filtro.ejemplares_restantes.$gt
      )
        return consulta(null);
      libro.ejemplares_restantes += cambio.$inc.ejemplares_restantes;
      return consulta(libro);
    },
  };
}

describe('Libros HTTP (persistencia simulada)', () => {
  let app: INestApplication<App>;
  const datos = {
    titulo: 'El principito',
    autor: 'Antoine de Saint-Exupéry',
    genero: 'Fábula',
    portada_url: 'https://example.com/portada.jpg',
    aniopublicacion: 1943,
    ejemplares_restantes: 1,
  };

  beforeEach(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [LibrosController],
      providers: [
        LibrosService,
        {
          provide: getModelToken(LibroMongo.name),
          useValue: crearModeloDePrueba(),
        },
      ],
    }).compile();
    app = modulo.createNestApplication();
    app.enableCors({ origin: 'http://localhost:4200' });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('conserva el contrato del catálogo durante todo el CRUD', async () => {
    const api = request(app.getHttpServer());
    await api.get('/libros').expect(200).expect([]);
    const creado = await api.post('/libros').send(datos).expect(201);
    const libro = creado.body as { id: string };
    expect(libro.id).toMatch(/^[a-f0-9]{24}$/);
    expect(creado.body).toEqual({ ...datos, id: libro.id, disponible: true });
    await api.get('/libros').expect(200).expect([creado.body]);
    await api
      .get('/libros/' + libro.id)
      .expect(200)
      .expect(creado.body);
    await api
      .patch('/libros/' + libro.id)
      .send({ titulo: 'Nuevo título', ejemplares_restantes: 0 })
      .expect(200)
      .expect({
        ...datos,
        id: libro.id,
        titulo: 'Nuevo título',
        ejemplares_restantes: 0,
        disponible: false,
      });
    await api
      .delete('/libros/' + libro.id)
      .expect(204)
      .expect('');
    await api.get('/libros/' + libro.id).expect(404);
    await api.delete('/libros/' + libro.id).expect(404);
  });

  it('reserva el último ejemplar y rechaza reservas sin stock', async () => {
    const api = request(app.getHttpServer());
    const creado = await api.post('/libros').send(datos).expect(201);
    const { id } = creado.body as { id: string };
    await api
      .post('/libros/' + id + '/reservar')
      .expect(200)
      .expect({ ...datos, id, ejemplares_restantes: 0, disponible: false });
    await api.post('/libros/' + id + '/reservar').expect(400);
    await api
      .post('/libros/' + new Types.ObjectId().toString() + '/reservar')
      .expect(404);
  });

  it('valida creación y actualización con class-validator sin pipes', async () => {
    const api = request(app.getHttpServer());
    for (const invalido of [
      {},
      { ...datos, titulo: '   ' },
      { ...datos, autor: 123 },
      { ...datos, portada_url: 'archivo.jpg' },
      { ...datos, ejemplares_restantes: -1 },
      { ...datos, ejemplares_restantes: 1.5 },
      { ...datos, aniopublicacion: 999 },
      { ...datos, disponible: true },
      { ...datos, id: 'elegido-por-cliente' },
    ])
      await api.post('/libros').send(invalido).expect(400);
    const creado = await api.post('/libros').send(datos).expect(201);
    const { id } = creado.body as { id: string };
    for (const invalido of [
      {},
      { autor: null },
      { titulo: '' },
      { id: 'otro' },
      { disponible: false },
    ]) {
      await api
        .patch('/libros/' + id)
        .send(invalido)
        .expect(400);
    }
    await api.get('/libros/abc').expect(400);
    await api
      .patch('/libros/' + new Types.ObjectId().toString())
      .send({ titulo: 'Otro' })
      .expect(404);
  });

  it('permite peticiones del frontend por CORS', async () => {
    await request(app.getHttpServer())
      .options('/libros')
      .set('Origin', 'http://localhost:4200')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://localhost:4200');
  });
});
