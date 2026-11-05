import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { LogsMiddleware } from './middleware/logs.middleware';
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
  imports: [
    MongooseModule.forRoot(mongoUri),
    LibrosModule,
    AuthModule,
    FavoritosModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
