# CRUD de libros en memoria

Ejecutar `npm run start:dev` desde la raíz y probar las peticiones de
`libros.http` con REST Client de VS Code, Postman o cualquier cliente HTTP.
La URL base es `http://localhost:3000`.

- `POST /libros`: crea un libro con `titulo` y `autor`. Devuelve 201.
- `GET /libros`: devuelve una lista de libros (inicialmente vacía).
- `GET /libros/:id`: devuelve un libro o 404 si no existe.
- `PATCH /libros/:id`: modifica `titulo`, `autor` o ambos.
- `DELETE /libros/:id`: elimina un libro y devuelve 204 sin cuerpo.

Un libro tiene la forma `{ "id": 1, "titulo": "El principito", "autor": "Antoine" }`.
El servidor genera IDs consecutivos y no reutiliza los eliminados.
Los textos vacíos, campos desconocidos y datos de tipos incorrectos devuelven 400.

Para explicar en clase:

1. El módulo registra el controlador y el servicio.
2. El controlador recibe método HTTP, parámetros de ruta y cuerpo JSON.
3. Nest inyecta el servicio mediante el constructor.
4. El servicio valida y realiza las operaciones sobre un diccionario
   `Record<number, Libro>`, donde cada ID apunta a un libro.
5. El controlador devuelve el resultado y Nest lo serializa como JSON.

El diccionario vive en la memoria del proceso: los datos se pierden al reiniciar
y no se comparten entre distintas instancias del servidor. No hay base de datos
ni persistencia en archivos.

Verificación del flujo HTTP: `npm run test:e2e -- --runInBand`.
