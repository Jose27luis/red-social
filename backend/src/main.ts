import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ===============================================
  // CONFIGURACIÓN DE SEGURIDAD CON HELMET
  // ===============================================
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
              },
            }
          : false, // Deshabilitado en desarrollo para Swagger

      // Cross-Origin-Embedder-Policy
      crossOriginEmbedderPolicy: false, // Relajado para APIs

      // Cross-Origin-Opener-Policy
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

      // Cross-Origin-Resource-Policy
      crossOriginResourcePolicy: { policy: 'cross-origin' },

      // DNS Prefetch Control (desactiva DNS prefetching del navegador)
      dnsPrefetchControl: { allow: false },

      // Frameguard (previene clickjacking)
      frameguard: { action: 'deny' },

      // Hide Powered By (oculta que usamos Express)
      hidePoweredBy: true,

      // HTTP Strict Transport Security (HSTS)
      hsts: {
        maxAge: 31536000, // 1 año en segundos
        includeSubDomains: true,
        preload: true,
      },

      // IE No Open (previene que IE ejecute descargas en el contexto del sitio)
      ieNoOpen: true,

      // No Sniff (previene MIME type sniffing)
      noSniff: true,

      // Origin Agent Cluster
      originAgentCluster: true,

      // Permitted Cross-Domain Policies
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },

      // Referrer Policy
      referrerPolicy: { policy: 'no-referrer' },

      // X-XSS-Protection (protección XSS legacy)
      xssFilter: true,
    }),
  );

  // Configuración de CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Red Académica API')
    .setDescription('API para Red Social Académica Interna')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(` Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
