# Frontend conectado a Nest

1. En clase12 configurá MongoDB y JWT_SECRET en .env e iniciá npm run start:dev (puerto 3100).
2. En clase8 ejecutá npm install y npm start (puerto 4200).
3. Creá una cuenta desde /register. El registro inicia la sesión directamente.

La URL de la API está en src/environments/environment.ts. Registro, login, perfil,
libros, reservas y favoritos usan HttpClient. El interceptor agrega el JWT solo a
esa API. La sesión se restaura consultando /auth/me; un 401 cierra la sesión.
Las contraseñas requieren entre 8 y 128 caracteres. No hay confirmación por email.

Favoritos y notas se guardan por usuario en MongoDB. Agregar libros está disponible
para cualquier usuario autenticado, como en el backend actual (sin permisos por rol).
El catálogo se actualiza tras crear o reservar y mediante Actualizar catálogo;
no hay una suscripción en tiempo real entre navegadores.

Esta integración no importa los usuarios, libros ni favoritos del proveedor anterior.
El service worker solo guarda archivos estáticos; no cachea las respuestas privadas.

Los servicios de libros y favoritos devuelven directamente las llamadas HttpClient.
Cada pantalla usa subscribe({ next, error }) para mostrar el resultado. El backend
valida el vencimiento del JWT; el frontend cierra la sesión cuando recibe un 401.
