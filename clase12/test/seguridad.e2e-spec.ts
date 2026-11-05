import {
  INestApplication,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { Usuario } from '../src/auth/usuario.schema';
import { LibrosController } from '../src/libros/libros.controller';
import { LibrosService } from '../src/libros/libros.service';
import { LogsMiddleware } from '../src/middleware/logs.middleware';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Types, mongo } from 'mongoose';
import { FavoritosController } from '../src/favoritos/favoritos.controller';
import { FavoritosService } from '../src/favoritos/favoritos.service';
import { Favorito } from '../src/favoritos/favorito.schema';

@Module({
  imports: [AuthModule, ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])],
  controllers: [LibrosController, AppController, FavoritosController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: LibrosService, useValue: { listar: () => [] } },
    FavoritosService,
    { provide: getModelToken(Favorito.name), useValue: {} },
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}

describe('JWT y middlewares HTTP', () => {
  let app: INestApplication<App>;
  let logs: jest.SpyInstance;
  const secret = 'test-secret-only-abcdefghijklmnopqrstuvwxyz';
  const credenciales = {
    email: 'ana@example.com',
    password: 'clave-segura-123',
  };
  const originalEnv = { ...process.env };
  let usuarios: Map<
    string,
    {
      id: string;
      email: string;
      passwordHash: string;
      nombre?: string;
      apellido?: string;
    }
  >;

  beforeEach(async () => {
    process.env.JWT_SECRET = secret;
    usuarios = new Map();
    const modulo = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(getModelToken(Usuario.name))
      .useValue({
        create: (datos: {
          email: string;
          passwordHash: string;
          nombre?: string;
          apellido?: string;
        }) => {
          if (usuarios.has(datos.email))
            return Promise.reject(
              new mongo.MongoServerError({ message: 'Duplicado', code: 11000 }),
            );
          const usuario = { ...datos, id: new Types.ObjectId().toString() };
          usuarios.set(datos.email, usuario);
          return Promise.resolve(usuario);
        },
        findOne: ({ email }: { email: string }) => ({
          select: () => ({
            exec: () => Promise.resolve(usuarios.get(email) ?? null),
          }),
        }),
        findById: (id: string) => ({
          exec: () =>
            Promise.resolve(
              [...usuarios.values()].find((u) => u.id === id) ?? null,
            ),
        }),
      })
      .compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    logs = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    logs.mockRestore();
    process.env = { ...originalEnv };
  });

  it('registra, hashea, inicia sesión y permite acceder con Bearer', async () => {
    const api = request(app.getHttpServer());
    await api.get('/libros').expect(401);
    await api.get('/').expect(401);
    const registro = await api
      .post('/auth/register')
      .send({
        ...credenciales,
        email: ' ANA@example.com ',
        nombre: 'Ana',
        apellido: 'Pérez',
      })
      .expect(201);
    const { access_token: token } = registro.body as { access_token: string };
    expect(usuarios.get(credenciales.email)?.passwordHash).not.toContain(
      credenciales.password,
    );
    expect(registro.body).not.toHaveProperty('passwordHash');
    await api
      .get('/libros')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([]);
    const login = await api.post('/auth/login').send(credenciales).expect(200);
    const sesion = login.body as { access_token: string };
    const perfil = await api
      .get('/auth/me')
      .set('Authorization', `Bearer ${sesion.access_token}`)
      .expect(200);
    expect(perfil.body).toEqual({
      id: usuarios.get(credenciales.email)?.id,
      email: credenciales.email,
      nombre: 'Ana',
      apellido: 'Pérez',
      rol: 'user',
    });
    await api.get('/auth/me').expect(401);
    await api
      .get('/')
      .set('Authorization', `Bearer ${sesion.access_token}`)
      .expect(200);
    await api
      .get('/libros')
      .set('Authorization', `Bearer ${sesion.access_token}`)
      .expect(200);
    await api.post('/auth/register').send(credenciales).expect(409);
    await api
      .post('/auth/login')
      .send({ ...credenciales, password: 'incorrecta' })
      .expect(401);
  });

  it('rechaza contraseñas mayores a 72 bytes sin truncarlas', async () => {
    const api = request(app.getHttpServer());
    for (const password of ['a'.repeat(73), 'ñ'.repeat(37)]) {
      await api
        .post('/auth/register')
        .send({ ...credenciales, password })
        .expect(400);
    }
    const password = 'ñ'.repeat(36);
    await api
      .post('/auth/register')
      .send({ ...credenciales, password })
      .expect(201);
    await api
      .post('/auth/login')
      .send({ ...credenciales, password })
      .expect(200);
  });

  it('rechaza JWT inválidos, vencidos o firmados con otro secreto', async () => {
    const jwt = new JwtService({ secret });
    const base = { sub: '123', email: credenciales.email };
    const tokens = [
      'incorrecto',
      jwt.sign(base, { expiresIn: -1 }),
      jwt.sign(base, { secret: 'otro-secreto', expiresIn: 3600 }),
    ];
    for (const token of tokens)
      await request(app.getHttpServer())
        .get('/libros')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
  });

  it('valida datos y limita intentos de auth con Retry-After', async () => {
    const api = request(app.getHttpServer());
    await api
      .post('/auth/register')
      .send({ email: 'mal', password: 'x' })
      .expect(400);
    for (let i = 0; i < 10; i++)
      await api.post('/auth/login').send(credenciales).expect(401);
    const respuesta = await api
      .post('/auth/login')
      .send(credenciales)
      .expect(429);
    expect(respuesta.headers['retry-after']).toBeDefined();
    // Registro tiene su propio contador, independiente de login.
    await api.post('/auth/register').send(credenciales).expect(201);
    await api.get('/libros').expect(401);
  });

  it('limita también solicitudes no autenticadas y no registra secretos', async () => {
    const api = request(app.getHttpServer());
    for (let i = 0; i < 100; i++)
      await api
        .get('/libros?token=secreto-query')
        .set('Authorization', 'Bearer secreto-header')
        .expect(401);
    const respuesta = await api.get('/libros').expect(429);
    expect(respuesta.headers['retry-after']).toBeDefined();
    // Cada endpoint tiene su propio contador por IP.
    await api.post('/auth/login').send(credenciales).expect(401);
    const salida = JSON.stringify(logs.mock.calls);
    expect(salida).toContain('GET /libros');
    expect(salida).not.toContain('secreto-query');
    expect(salida).not.toContain('secreto-header');
  });

  it('mantiene los favoritos privados y permite crear, editar y borrar notas', async () => {
    type Registro = Favorito & { id: string };
    const registros: Registro[] = [];
    const consulta = <T>(dato: T) => ({ exec: () => Promise.resolve(dato) });
    const modelo = app.get<Record<string, unknown>>(
      getModelToken(Favorito.name),
    );
    Object.assign(modelo, {
      find: ({ user_id }: { user_id: string }) => ({
        sort: () => consulta(registros.filter((f) => f.user_id === user_id)),
      }),
      create: (datos: Favorito) => {
        if (
          registros.some(
            (f) => f.user_id === datos.user_id && f.book_id === datos.book_id,
          )
        )
          throw Object.assign(new Error('Duplicado'), { code: 11000 });
        const favorito = { ...datos, id: new Types.ObjectId().toString() };
        registros.push(favorito);
        return Promise.resolve(favorito);
      },
      findOneAndUpdate: (
        filtro: { _id: string; user_id: string },
        cambios: { $set: { nota: string } },
      ) => {
        const favorito = registros.find(
          (f) => f.id === filtro._id && f.user_id === filtro.user_id,
        );
        if (favorito) favorito.nota = cambios.$set.nota;
        return consulta(favorito ?? null);
      },
      findOneAndDelete: (filtro: { _id: string; user_id: string }) => {
        const index = registros.findIndex(
          (f) => f.id === filtro._id && f.user_id === filtro.user_id,
        );
        return consulta(index < 0 ? null : registros.splice(index, 1)[0]);
      },
    });
    const libro = { id: new Types.ObjectId().toString(), titulo: 'Libro' };
    Object.assign(app.get(LibrosService), {
      listar: () => Promise.resolve([libro]),
      buscar: () => Promise.resolve(libro),
    });
    const jwt = new JwtService({ secret });
    const token = jwt.sign(
      { sub: 'usuario-a', email: 'a@example.com' },
      { expiresIn: 3600 },
    );
    const otro = jwt.sign(
      { sub: 'usuario-b', email: 'b@example.com' },
      { expiresIn: 3600 },
    );
    const api = request(app.getHttpServer());
    const auth = `Bearer ${token}`;
    await api.get('/favoritos').expect(401);
    const creado = await api
      .post('/favoritos')
      .set('Authorization', auth)
      .send({ book_id: libro.id, nota: 'Leer' })
      .expect(201);
    const { id } = creado.body as { id: string };
    await api
      .post('/favoritos')
      .set('Authorization', auth)
      .send({ book_id: libro.id, nota: '' })
      .expect(409);
    await api
      .post('/favoritos')
      .set('Authorization', auth)
      .send({ book_id: libro.id, nota: '', user_id: 'otro' })
      .expect(400);
    await api
      .get('/favoritos')
      .set('Authorization', `Bearer ${otro}`)
      .expect(200)
      .expect([]);
    await api
      .patch('/favoritos/' + id)
      .set('Authorization', `Bearer ${otro}`)
      .send({ nota: 'Otra' })
      .expect(404);
    await api
      .delete('/favoritos/' + id)
      .set('Authorization', `Bearer ${otro}`)
      .expect(404);
    await api
      .patch('/favoritos/' + id)
      .set('Authorization', auth)
      .send({ nota: 'Leído' })
      .expect(200);
    const lista = await api
      .get('/favoritos')
      .set('Authorization', auth)
      .expect(200);
    expect(lista.body).toEqual([
      expect.objectContaining({ id, nota: 'Leído', libros: libro }),
    ]);
    await api
      .delete('/favoritos/' + id)
      .set('Authorization', auth)
      .expect(204);
    await api
      .get('/favoritos')
      .set('Authorization', auth)
      .expect(200)
      .expect([]);
  });
});
