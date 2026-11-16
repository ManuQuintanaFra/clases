import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Rol } from './rol';

@Schema({ collection: 'usuarios', timestamps: true })
export class Usuario {
  @Prop({ default: '' })
  nombre!: string;

  @Prop({ default: '' })
  apellido!: string;

  @Prop({ type: String, default: 'user', enum: ['user', 'admin'] })
  rol!: Rol;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
