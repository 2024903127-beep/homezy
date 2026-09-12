import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  // In production, set CORS_ORIGINS="https://homezy.in,https://admin.homezy.in"
  // In development, falls back to allowing all origins.
  const rawOrigins = config.get<string>('CORS_ORIGINS');
  if (rawOrigins) {
    const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: true,
    });
    logger.log(`CORS restricted to: ${allowedOrigins.join(', ')}`);
  } else {
    app.enableCors(); // dev: allow all
    logger.warn('CORS_ORIGINS not set — allowing all origins (dev mode)');
  }

  // ── JWT secret sanity check ───────────────────────────────────────────────
  const jwtSecret = config.get<string>('JWT_SECRET', '');
  if (!jwtSecret || jwtSecret === 'homezy-dev-secret-change-before-production') {
    logger.warn(
      '⚠️  JWT_SECRET is insecure! Run: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))" and set it in .env',
    );
  }

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Homezy API')
    .setDescription(
      'Shared backend for the Homezy consumer app, Homezy Partner app, and admin panel. ' +
        'See README.md for the module-to-app mapping.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  logger.log(`Homezy API running on http://localhost:${port}/v1`);
  logger.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
