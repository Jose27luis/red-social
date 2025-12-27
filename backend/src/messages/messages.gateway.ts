import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('MessagesGateway');
  private readonly onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extraer token del handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verificar JWT
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;

      if (!client.userId) {
        this.logger.warn(`Client ${client.id} rejected: Invalid user ID`);
        client.disconnect();
        return;
      }

      // Registrar usuario como online
      this.onlineUsers.set(client.userId, client.id);

      // Unirse a sala personal
      client.join(`user:${client.userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${client.userId})`);
      this.logger.log(`Online users: ${this.onlineUsers.size}`);

      // Notificar a otros usuarios que este usuario está online
      this.server.emit('user:online', { userId: client.userId });

      // Enviar lista de usuarios online al cliente que se conecta
      client.emit('online:users', Array.from(this.onlineUsers.keys()));
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.onlineUsers.delete(client.userId);
      this.logger.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
      this.logger.log(`Online users: ${this.onlineUsers.size}`);

      // Notificar a otros usuarios que este usuario está offline
      this.server.emit('user:offline', { userId: client.userId });
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: SendMessageDto) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Crear mensaje en la base de datos
      const message = await this.messagesService.sendMessage(client.userId, data);

      // Enviar mensaje al receptor si está online
      const recipientSocketId = this.onlineUsers.get(data.receiverId);
      if (recipientSocketId) {
        this.server.to(`user:${data.receiverId}`).emit('message:received', message);
      }

      // Confirmar al emisor
      client.emit('message:sent', message);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('message:typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    if (!client.userId) return;

    // Enviar notificación de "escribiendo" al receptor
    this.server.to(`user:${data.receiverId}`).emit('user:typing', {
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationUserId: string },
  ) {
    try {
      if (!client.userId) return;

      // Marcar conversación como leída
      await this.messagesService.markAsRead(client.userId, data.conversationUserId);

      // Notificar al otro usuario que sus mensajes fueron leídos
      this.server.to(`user:${data.conversationUserId}`).emit('messages:read', {
        userId: client.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      return { error: error.message };
    }
  }

  // Método helper para enviar notificación de nuevo mensaje a un usuario
  sendMessageNotification(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('message:notification', message);
  }

  // Método helper para obtener usuarios online
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  // Método helper para verificar si un usuario está online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
