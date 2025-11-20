import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for all origins
  app.enableCors(); // or: app.enableCors({ origin: true, credentials: true });

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // extra fields from body/query are stripped
      forbidNonWhitelisted: true, // extra fields -> 400 error
      transform: true, // auto-transform payloads to DTO classes
      transformOptions: {
        enableImplicitConversion: true, // "1" -> number, "true" -> boolean, etc.
      },
    }),
  );

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle('iCorp Interview API')
    .setDescription('Test API integration via NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // → http://localhost:3000/api-docs

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
