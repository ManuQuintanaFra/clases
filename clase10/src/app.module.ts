import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LibrosModule } from './libros/libros.module';
import { MongooseModule } from '@nestjs/mongoose';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Node 22 carga las variables antes de configurar la conexión a Atlas.
if (existsSync('.env')) loadEnvFile('.env');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error(
    'Configurá MONGODB_URI en .env con la conexión de MongoDB Atlas',
  );
}

@Module({
  imports: [MongooseModule.forRoot(mongoUri), LibrosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
