# Backend de libros para clase8

El catálogo de Angular consume este backend Nest en `http://localhost:3100`.
Usa MongoDB Atlas: copiar `.env.example` como `.env` y configurar `MONGODB_URI`.
Iniciar con `npm run start:dev`; el frontend se inicia con `npm start` desde clase8.

Ver [la guía del módulo](src/libros/README.md) para configuración, endpoints,
validaciones y el alcance de la migración. Las peticiones de ejemplo están en
`libros.http`. El frontend usa JWT para autenticación y MongoDB para usuarios,
libros y favoritos. La configuración está en `clase8/src/environments/environment.ts`.

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Subida de portadas

Ver [configuración, uso y controles de seguridad](PORTADAS.md).


## Autenticación JWT, logs y rate limit

Configurá `JWT_SECRET` en `.env` con un valor aleatorio de al menos 32 bytes.
Podés generarlo con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
La aplicación falla al iniciar si falta el secreto. No lo publiques ni lo subas al repositorio.

- `POST /auth/register`: recibe `{ "email": "ana@example.com", "password": "clave-segura-123" }`, crea un usuario en MongoDB y devuelve un token (201).
- `POST /auth/login`: recibe las mismas credenciales y devuelve `access_token`, `token_type: "Bearer"` y `expires_in: 3600` (200).
- Todas las rutas, incluyendo `/libros` y `GET /`, requieren `Authorization: Bearer <access_token>`. Solo registro y login son públicos.
- Email duplicado: 409; credenciales o token inválidos/vencidos: 401; datos inválidos: 400.

JWT tiene tres pasos: `JwtModule` configura el secreto y la duración, `AuthService`
genera el token con `signAsync()`, y `JwtStrategy` de Passport verifica el Bearer,
la firma y el vencimiento. Su método `validate()` devuelve los datos de `req.user`.
`JwtAuthGuard` solo extiende `AuthGuard('jwt')`. Si el token es inválido, responde 401.
El decorador incorporado `@UseGuards(JwtAuthGuard)` protege los controladores de
libros, favoritos y la raíz, y el endpoint `GET /auth/me`. Login y registro no
tienen guard. Para proteger nuevas rutas hay que agregar `@UseGuards` al método
o al controlador; JWT ya no se registra globalmente. No hay decoradores personalizados.

Las contraseñas se guardan con `bcrypt.hash(password, 10)` y se verifican con
`bcrypt.compare()`. Se admiten al menos 8 caracteres y como máximo 72 bytes.
Las cuentas de prueba anteriores deben registrarse nuevamente con otro email;
sus hashes scrypt no se migran. Los JWT duran una hora;
no hay refresh token ni revocación anticipada. Todos los usuarios registrados tienen
acceso al CRUD y reservas; esta implementación no agrega roles.

El frontend debe obtener el token de este backend y enviarlo en cada solicitud a libros.
Los tokens y usuarios anteriores de Supabase no se migran ni se aceptan automáticamente.
Favoritos ahora se guarda en MongoDB y pertenece al usuario identificado por el JWT.

`GET /auth/me` devuelve id, email, nombre, apellido y rol, sin contraseña.
El registro admite nombre y apellido opcionales. El cliente no puede elegir su rol.
`GET /favoritos`, `POST /favoritos` (`book_id`, `nota`), `PATCH /favoritos/:id`
(`nota`) y `DELETE /favoritos/:id` requieren JWT y solo acceden a favoritos propios.
Un favorito duplicado responde 409 y uno inexistente o ajeno responde 404.

El middleware de logs muestra el método y la ruta al recibir la solicitud,
por ejemplo `GET /libros`, y continúa con `next()`. No registra query strings,
cuerpos ni encabezados de autorización.

El rate limit se configura también en `AppModule` usando `@nestjs/throttler`:
- `ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])`: 100 solicitudes por minuto.
- `@Throttle({ default: { ttl: 15 * 60 * 1000, limit: 10 } })` en login y registro: 10 solicitudes cada 15 minutos. El perfil usa el límite general.

Los límites se cuentan por IP y endpoint: login y registro tienen contadores separados.
El guard se ejecuta antes de JWT y responde 429 con `Retry-After` al superar el límite.
Los valores se cambian directamente en el código. Los contadores están en memoria y
se reinician al reiniciar el servidor. Aplica a las rutas de Nest, no a rutas inexistentes
ni a preflight CORS.

Referencias: [JWT en NestJS 11](https://docs.nestjs.com/v11/techniques/authentication)
y [Throttler de NestJS](https://docs.nestjs.com/security/rate-limiting).



