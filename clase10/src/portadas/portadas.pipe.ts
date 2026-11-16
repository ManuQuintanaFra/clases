import { ArgumentMetadata, BadRequestException, Injectable, ParseFilePipeBuilder, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class PortadasPipe implements PipeTransform {
 async transform(archivo: any, metadata: ArgumentMetadata) {
    if(!archivo) return;
    const extension = extname(archivo.originalname).slice(1).toLowerCase();
    const formato = extension === 'jpg' ? 'jpeg' : extension;

    if(!['jpeg', 'png', 'webp'].includes(formato)){
      throw new BadRequestException('La portada debe ser jpg, png o webp')
    }
    const pipe = new ParseFilePipeBuilder().addFileTypeValidator({
      fileType: `image/${formato}`,
      errorMessage: 'El contenido no corresponde a la extension de la portada'
    }).build();
    await pipe.transform(archivo)
    return archivo;
  }
}
