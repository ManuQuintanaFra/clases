import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

// Pipe: valida que el parámetro sea un ObjectId de MongoDB antes de
// llegar al controlador. Si no lo es, responde 400 sin tocar la base.
//   @Param('id', ParseMongoIdPipe) id: string
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(valor: string, metadata: ArgumentMetadata): string {
    if (!isObjectIdOrHexString(valor)) {
      throw new BadRequestException(
        `El parámetro "${metadata.data ?? 'id'}" no es un ID válido`,
      );
    }
    return valor;
  }
}
