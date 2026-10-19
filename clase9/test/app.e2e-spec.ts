import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });

  it('permite crear, listar, buscar, actualizar y eliminar libros', async () => {
    const api = request(app.getHttpServer());
    await api.get('/libros').expect(200).expect([]);
    await api
      .post('/libros')
      .send({ titulo: ' El principito ', autor: 'Antoine' })
      .expect(201)
      .expect({ id: 1, titulo: 'El principito', autor: 'Antoine' });
    await api
      .get('/libros')
      .expect(200)
      .expect([{ id: 1, titulo: 'El principito', autor: 'Antoine' }]);
    await api.get('/libros/1').expect(200);
    await api
      .patch('/libros/1')
      .send({ titulo: 'Otro título' })
      .expect(200)
      .expect({ id: 1, titulo: 'Otro título', autor: 'Antoine' });
    await api.delete('/libros/1').expect(204).expect('');
    await api.get('/libros/1').expect(404);
    await api.patch('/libros/1').send({ titulo: 'No existe' }).expect(404);
    await api.delete('/libros/1').expect(404);
    await api
      .post('/libros')
      .send({ titulo: 'Nuevo', autor: 'Autor' })
      .expect(201)
      .expect({ id: 2, titulo: 'Nuevo', autor: 'Autor' });
  });

  it('rechaza datos inválidos e IDs no numéricos', async () => {
    const api = request(app.getHttpServer());
    await api
      .post('/libros')
      .send({ titulo: '   ', autor: 'Autor' })
      .expect(400);
    await api.post('/libros').send({ titulo: 'Libro' }).expect(400);
    await api.post('/libros').send({ titulo: 'Libro', autor: 123 }).expect(400);
    await api.get('/libros/abc').expect(400);
    await api
      .post('/libros')
      .send({ titulo: 'Libro', autor: 'Autor' })
      .expect(201);
    await api.patch('/libros/1').send({}).expect(400);
    await api.patch('/libros/1').send({ id: 99 }).expect(400);
    await api.patch('/libros/1').send({ autor: null }).expect(400);
  });
});
