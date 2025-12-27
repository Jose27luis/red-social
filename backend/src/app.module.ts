import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { GroupsModule } from './groups/groups.module';
import { MessagesModule } from './messages/messages.module';
import { EventsModule } from './events/events.module';
import { ResourcesModule } from './resources/resources.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Serve uploaded files statically
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // ===============================================
    // RATE LIMITING CON @NESTJS/THROTTLER
    // ===============================================
    // Configuración de múltiples limitadores para diferentes casos de uso
    // Rate limiting - Límites aumentados para pruebas de carga (LOAD_TEST=true)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: process.env.LOAD_TEST === 'true' ? 100 : 3, // 3 requests/s (100 en modo test)
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: process.env.LOAD_TEST === 'true' ? 500 : 20, // 20 requests/10s (500 en modo test)
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: process.env.LOAD_TEST === 'true' ? 2000 : Number.parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostsModule,
    GroupsModule,
    MessagesModule,
    EventsModule,
    ResourcesModule,
    NotificationsModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Aplicar ThrottlerGuard globalmente a todos los endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
