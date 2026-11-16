import {
  BadRequestException,
  ParseFilePipeBuilder,
  PipeTransform,
} from '@nestjs/common';
import { extname } from 'node:path';

export class PortadaPipe implements PipeTransform {
  async transform(archivo?: Express.Multer.File) {
    if (!archivo) return;

    const extension = extname(archivo.originalname).slice(1).toLowerCase();
    const formato = extension === 'jpg' ? 'jpeg' : extension;
    if (!['jpeg', 'png', 'webp'].includes(formato))
      throw new BadRequestException('La portada debe ser JPEG, PNG o WebP');

    const pipe = new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: `image/${formato}`,
        errorMessage:
          'El contenido no corresponde a la extensión de la portada',
      })
      .build();
    await pipe.transform(archivo);
    return archivo;
  }
}
