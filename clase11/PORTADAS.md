# Portadas con Multer y Cloudinary

## Configuración

Agregar a `.env` las variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y
`CLOUDINARY_API_SECRET` de tu cuenta (ver `.env.example`). Las credenciales solo
se usan en el backend. Reiniciar Nest después de configurarlas.

## Uso

Enviar una sola petición `POST /libros` como `multipart/form-data`:

- Texto: `titulo`, `autor`, `genero`, `aniopublicacion`, `ejemplares_restantes`.
- Archivo: `portada` (JPEG, PNG o WebP, hasta 5 MiB).

Devuelve 201 y el libro creado con la URL HTTPS en `portada_url`.
No existe una ruta separada para subir la portada.

```powershell
curl.exe -X POST "http://localhost:3100/libros" -F "titulo=El principito" -F "autor=Antoine de Saint-Exupéry" -F "genero=Fábula" -F "aniopublicacion=1943" -F "ejemplares_restantes=1" -F "portada=@C:/imagenes/portada.jpg"
```

```typescript
const datos = new FormData();
datos.append('titulo', libro.titulo);
datos.append('autor', libro.autor);
datos.append('genero', libro.genero);
datos.append('aniopublicacion', String(libro.aniopublicacion));
datos.append('ejemplares_restantes', String(libro.ejemplares_restantes));
datos.append('portada', archivo);
this.http.post(apiUrl + '/libros', datos).subscribe();
// No establecer Content-Type: el navegador agrega el boundary.
```

El archivo es opcional. Se conserva el POST JSON anterior; si se envía archivo,
no se admite también `portada_url`. Sin archivo ni URL se crea sin portada.

## Protección de archivos

- Multer 2.5 o posterior, también en la dependencia interna de Nest.
- Un archivo de hasta 5 MiB por petición; hasta seis campos de texto de 4 KiB cada uno y sin disco temporal.
- Firma binaria JPEG, PNG o WebP y decodificación real con Sharp. Se rechazan SVG,
  PDF, ejecutables, imágenes corruptas, animaciones y más de 20 millones de píxeles.
- Recodificación a WebP de hasta 1600 x 1600, sin metadatos ni contenido añadido.
  El nombre y MIME declarados por el cliente no determinan el formato admitido.
- Hasta cuatro subidas simultáneas por proceso, incluyendo recepción y conversión.
- Cloudinary recibe solo el resultado recodificado, como imagen, con un identificador
  aleatorio generado en el servidor y sin sobrescritura.
- Se elimina la portada al borrar el libro. Si falla la creación en Mongo,
  se intenta borrar la subida nueva. Fallos de limpieza quedan registrados para
  reconciliación manual; no hay una transacción distribuida ni cola de reintentos.

Por compatibilidad, el CRUD todavía admite `portada_url` externa. Esas URLs no se
descargan ni se inspeccionan y quedan fuera de las garantías del endpoint de archivos.
Para aplicar esta política a todas las portadas, el frontend debe usar la subida y
se debe retirar la entrada de URLs del DTO (los registros antiguos no se migran).

## Antes de exponer la API

El backend existente no valida usuarios ni permisos. CORS no autentica peticiones.
Agregar autenticación y autorización para editar libros y subir portadas, y límites
por usuario/IP y de tamaño/tiempo en el proxy. El límite simultáneo por proceso no
reemplaza cuotas ni rate limiting y no coordina varias instancias. Estas defensas
reducen el riesgo de archivos maliciosos; no equivalen a un antivirus ni garantizan
protección frente a vulnerabilidades futuras de los decodificadores.

## Verificación

`npm run build`, `npm test -- --runInBand` y `npm run test:e2e -- --runInBand`.
Las pruebas usan Sharp y Multer reales, Mongo y transporte de Cloudinary simulados.
La prueba contra los servicios externos requiere credenciales de los servicios externos.

Referencias: [Multer](https://www.npmjs.com/package/multer),
[Cloudinary upload_stream](https://cloudinary.com/documentation/node_image_and_video_upload),
[Sharp](https://sharp.pixelplumbing.com/api-constructor/).

