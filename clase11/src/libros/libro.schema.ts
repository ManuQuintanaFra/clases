import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'libros', versionKey: false })
export class LibroMongo {
  @Prop({ required: true, trim: true })
  titulo!: string;
  @Prop({ required: true, trim: true })
  autor!: string;
  @Prop({ default: '' })
  portada_url!: string;
  @Prop()
  portada_public_id?: string;
  @Prop({ required: true, trim: true })
  genero!: string;
  @Prop({ required: true })
  aniopublicacion!: number;
  @Prop({ required: true, min: 0, max: 99 })
  ejemplares_restantes!: number;
}
export type LibroDocument = HydratedDocument<LibroMongo>;
export const LibroSchema = SchemaFactory.createForClass(LibroMongo);
