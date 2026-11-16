import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'favoritos', timestamps: true })
export class Favorito {
  @Prop({ required: true })
  user_id!: string;

  @Prop({ required: true })
  book_id!: string;

  @Prop({ default: '' })
  nota!: string;
}

export const FavoritoSchema = SchemaFactory.createForClass(Favorito);
FavoritoSchema.index({ user_id: 1, book_id: 1 }, { unique: true });
