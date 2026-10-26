# Libros: Angular → HTTP → Nest → MongoDB

El frontend está en ../clase8 y el backend en clase9.
Se migró únicamente el catálogo de libros. Autenticación, usuarios y favoritos
continúan usando Supabase. No se incorporaron JWT, guards, Multer ni Cloudinary
en Nest. Las portadas se envían como URLs.

## Iniciar

1. Copiar .env.example como .env y reemplazar MONGODB_URI por la URI de Atlas.
2. Desde clase9: npm install y npm run start:dev.
3. Desde clase8: npm install y npm start.
4. Abrir http://localhost:4200.

El backend carga .env automáticamente con Node 22 (sin dependencias extra).
La URI de Atlas debe incluir el nombre de base de datos, por ejemplo biblioteca.
No se guarda la URI real en el código: .env está excluido de Git.
También se puede configurar la variable en PowerShell antes de iniciar Nest:

```powershell
$env:MONGODB_URI = 'mongodb+srv://USUARIO:CONTRASENA@TU_CLUSTER.mongodb.net/biblioteca?retryWrites=true&w=majority'
npm run start:dev
```

FRONTEND_ORIGIN permite cambiar el origen CORS (predeterminado http://localhost:4200).
La URL de Nest se configura con apiUrl en clase8/src/environments/environment.ts.

## Contrato HTTP

- POST /libros: crear; devuelve 201.
- GET /libros: listar ordenados por título.
- GET /libros/:id: buscar.
- PATCH /libros/:id: actualizar campos enviados.
- DELETE /libros/:id: eliminar; devuelve 204 sin cuerpo.
- POST /libros/:id/reservar: descuenta un ejemplar; devuelve el libro actualizado.

El cliente envía titulo, autor, genero, portada_url, aniopublicacion y
ejemplares_restantes. Nest devuelve además id (string, basado en el ObjectId de Mongo)
y disponible (calculado a partir del stock). No se permite modificar id ni disponible.

Los DTOs usan class-validator. Un ValidationPipe global convierte los datos a DTOs
y los valida antes de llamar al controlador, con transform, whitelist y
forbidNonWhitelisted activados. Los campos no permitidos se rechazan.
Un PATCH con un objeto vacío no modifica el libro. Datos inválidos devuelven 400;
un ID válido que no existe devuelve 404. Reservar sin stock devuelve 400.
El descuento es una operación atómica de MongoDB para evitar stock negativo.

## Alcance y límites

El servicio Angular conserva su API y signals: catálogo, alta, detalle y reserva
consumen Nest; también expone actualizarLibro y eliminarLibro. No se agregaron
pantallas nuevas de edición o borrado. Se eliminó Realtime de Supabase para libros;
los cambios hechos en este cliente se reflejan al recibir la respuesta HTTP.
Otros clientes deben recargar para verlos.

No se migraron los libros existentes de Supabase. MongoDB comienza vacío.
Favoritos se dejó intacto por alcance: su FK y JOIN siguen apuntando a libros de
Supabase. Por eso NO acepta los nuevos IDs de MongoDB ni muestra sus actualizaciones.
Resolver esa relación requiere otra migración; no se sincronizan ambas bases.

La API de libros no tiene autenticación: las restricciones de Angular existentes
no protegen los endpoints. Es un ejemplo didáctico para los temas vistos.

## Verificar

- npm run build
- npm test -- --runInBand
- npm run test:e2e -- --runInBand

Las pruebas HTTP usan un doble de persistencia; comprueban el controlador, DTOs,
servicio, contrato del catálogo, reserva, errores y CORS. No verifican una conexión
a MongoDB real. Para comprobarla, configurar Atlas, iniciar Nest y usar libros.http.
