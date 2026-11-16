import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, _res: Response, next: NextFunction) {
    const inicio = Date.now();
    this.logger.log(`${req.method} ${req.originalUrl.split('?')[0]}`);
    _res.once('finish',()=>{
        const duracion = Date.now() - inicio;
        console.log(`← ${_res.statusCode} (${duracion} ms)`);
    })
    next();

  }
}
