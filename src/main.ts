import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import * as csrf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.use(cookieParser());
  app.use(helmet());

  app.use(csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    },
    value: (req) => req.headers['x-csrf-token'] || req.cookies['XSRF-TOKEN']
  }));
  app.set('trust proxy', 1);

  await app.listen(3025);
}

bootstrap();
