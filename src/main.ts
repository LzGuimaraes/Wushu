import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { isAllowedOrigin } from './config/frontend-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  app.enableCors({
    origin: (origin, callback) => {
      // Requisições sem Origin (server-to-server, Postman, etc.) passam sem
      // headers CORS; navegadores vindos de origens não permitidas são
      // bloqueados pelo próprio browser.
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
