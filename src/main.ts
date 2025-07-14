import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(), // Use default NestJS logger instance
  });
  app.useLogger(
    new Logger('NestApplication', {
      timestamp: true, // Add timestamp to logs
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Digital Wallet API')
    .setDescription('API documentation for the Digital Wallet application')
    .setVersion('1.0')
    .addBearerAuth(
      // Add JWT Bearer token authentication to Swagger UI
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // This name is used in @ApiBearerAuth() decorator
    )
    .addTag('Auth', 'User authentication and authorization') // Add tags for grouping endpoints
    // Add more tags as you add more modules (e.g., 'Wallets', 'Transactions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
