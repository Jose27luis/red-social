import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
    // ===============================================
    // RATE LIMITING CON @NESTJS/THROTTLER
    // ===============================================
    // Configuración de múltiples limitadores para diferentes casos de uso
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3, // 3 requests por segundo (para endpoints muy sensibles como login)
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20, // 20 requests por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10), // 100 requests por minuto (default global)
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
