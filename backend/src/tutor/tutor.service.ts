import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiService, FunctionCall, GeminiResponse } from './gemini.service';
import { SendTutorMessageDto } from './dto';
import { Content } from '@google/generative-ai';
import { TutorMessage, TutorConversation } from '@prisma/client';

interface UserContext {
  id: string;
  career?: string;
}

interface ConversationWithMessages extends TutorConversation {
  messages: TutorMessage[];
}

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private readonly MAX_FUNCTION_CALLS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async sendMessage(userId: string, dto: SendTutorMessageDto) {
    if (!this.geminiService.isAvailable()) {
      throw new BadRequestException('El servicio de Tutor IA no esta disponible en este momento.');
    }

    // Get user info for context
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, career: true, firstName: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Rate limiting: max 20 messages per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMessages = await this.prisma.tutorMessage.count({
      where: {
        conversation: { userId },
        role: 'user',
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentMessages >= 20) {
      throw new BadRequestException('Has alcanzado el limite de mensajes. Espera un momento antes de continuar.');
    }

    // Get or create conversation
    let conversation: ConversationWithMessages;
    if (dto.conversationId) {
      const found = await this.prisma.tutorConversation.findFirst({
        where: { id: dto.conversationId, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (!found) {
        throw new NotFoundException('Conversacion no encontrada');
      }
      conversation = found;
    } else {
      conversation = await this.prisma.tutorConversation.create({
        data: {
          userId,
          title: dto.content.substring(0, 50) + (dto.content.length > 50 ? '...' : ''),
        },
        include: { messages: true },
      });
    }

    // Save user message
    await this.prisma.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: dto.content,
      },
    });

    // Build history for Gemini
    const history: Content[] = conversation.messages.map((msg: TutorMessage) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const systemPrompt = this.geminiService.buildSystemPrompt(user.career || undefined);

    // Process with Gemini (may involve multiple function calls)
    let response: GeminiResponse;
    let functionCallCount = 0;
    let allFunctionResults: { name: string; result: string }[] = [];

    try {
      response = await this.geminiService.chat(dto.content, history, systemPrompt);

      // Handle function calls iteratively
      while (response.functionCalls && functionCallCount < this.MAX_FUNCTION_CALLS) {
        const functionResults = await this.executeFunctions(
          response.functionCalls,
          { id: userId, career: user.career || undefined },
          conversation.id,
        );
        allFunctionResults = [...allFunctionResults, ...functionResults];
        functionCallCount += response.functionCalls.length;

        // Continue conversation with function results
        response = await this.geminiService.continueWithFunctionResults(
          dto.content,
          history,
          allFunctionResults,
          systemPrompt,
        );
      }
    } catch (error) {
      this.logger.error('Error communicating with Gemini:', error);
      throw new BadRequestException('Error al procesar tu mensaje. Por favor intenta de nuevo.');
    }

    // Save assistant response
    const assistantMessage = await this.prisma.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: response.text || 'No pude generar una respuesta.',
      },
    });

    // Update conversation title if it's new
    if (!dto.conversationId) {
      await this.prisma.tutorConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    return {
      conversationId: conversation.id,
      message: assistantMessage,
      actionsExecuted: allFunctionResults.length,
    };
  }

  private async executeFunctions(
    functionCalls: FunctionCall[],
    userContext: UserContext,
    conversationId: string,
  ): Promise<{ name: string; result: string }[]> {
    const results: { name: string; result: string }[] = [];

    for (const fc of functionCalls) {
      try {
        const result = await this.executeFunction(fc.name, fc.args, userContext);
        results.push({ name: fc.name, result });

        // Log the action
        await this.prisma.tutorActionLog.create({
          data: {
            conversationId,
            functionName: fc.name,
            parameters: JSON.stringify(fc.args),
            result,
            success: true,
          },
        });
      } catch (error) {
        const errorResult = JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
        results.push({ name: fc.name, result: errorResult });

        await this.prisma.tutorActionLog.create({
          data: {
            conversationId,
            functionName: fc.name,
            parameters: JSON.stringify(fc.args),
            result: errorResult,
            success: false,
          },
        });
      }
    }

    return results;
  }

  private async executeFunction(
    functionName: string,
    args: Record<string, unknown>,
    userContext: UserContext,
  ): Promise<string> {
    switch (functionName) {
      case 'searchUsers':
        return this.searchUsers(args);
      case 'sendMessage':
        return this.sendDirectMessage(userContext.id, args);
      case 'searchPosts':
        return this.searchPosts(args);
      case 'createPost':
        return this.createPost(userContext.id, args);
      case 'searchGroups':
        return this.searchGroups(args);
      case 'joinGroup':
        return this.joinGroup(userContext.id, args);
      case 'searchEvents':
        return this.searchEvents(args);
      case 'registerToEvent':
        return this.registerToEvent(userContext.id, args);
      default:
        return JSON.stringify({ success: false, error: 'Funcion no reconocida' });
    }
  }

  private async searchUsers(args: Record<string, unknown>): Promise<string> {
    const { name, career } = args as { name?: string; career?: string };

    const where: Record<string, unknown> = {
      isActive: true,
      isVerified: true,
    };

    if (name) {
      where.OR = [
        { firstName: { contains: name, mode: 'insensitive' } },
        { lastName: { contains: name, mode: 'insensitive' } },
      ];
    }

    if (career) {
      where.career = { contains: career, mode: 'insensitive' };
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        career: true,
        profilePicture: true,
      },
      take: 10,
    });

    return JSON.stringify({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        career: u.career,
      })),
      count: users.length,
    });
  }

  private async sendDirectMessage(senderId: string, args: Record<string, unknown>): Promise<string> {
    const { userId, content } = args as { userId: string; content: string };

    if (!userId || !content) {
      return JSON.stringify({ success: false, error: 'Faltan parametros requeridos' });
    }

    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, isActive: true },
    });

    if (!receiver || !receiver.isActive) {
      return JSON.stringify({ success: false, error: 'Usuario no encontrado o inactivo' });
    }

    // Create message
    await this.prisma.message.create({
      data: {
        senderId,
        receiverId: userId,
        content: content.substring(0, 1000),
        isRead: false,
      },
    });

    return JSON.stringify({
      success: true,
      message: `Mensaje enviado a ${receiver.firstName} ${receiver.lastName}`,
    });
  }

  private async searchPosts(args: Record<string, unknown>): Promise<string> {
    const { query, authorName } = args as { query?: string; authorName?: string };

    const where: Record<string, unknown> = {};

    if (query) {
      where.content = { contains: query, mode: 'insensitive' };
    }

    if (authorName) {
      where.author = {
        OR: [
          { firstName: { contains: authorName, mode: 'insensitive' } },
          { lastName: { contains: authorName, mode: 'insensitive' } },
        ],
      };
    }

    const posts = await this.prisma.post.findMany({
      where,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return JSON.stringify({
      success: true,
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content.substring(0, 100) + (p.content.length > 100 ? '...' : ''),
        author: `${p.author.firstName} ${p.author.lastName}`,
        date: p.createdAt.toISOString(),
      })),
      count: posts.length,
    });
  }

  private async createPost(authorId: string, args: Record<string, unknown>): Promise<string> {
    const { content } = args as { content: string };

    if (!content) {
      return JSON.stringify({ success: false, error: 'El contenido es requerido' });
    }

    const post = await this.prisma.post.create({
      data: {
        authorId,
        content: content.substring(0, 3000),
        type: 'DISCUSSION',
      },
    });

    return JSON.stringify({
      success: true,
      message: 'Publicacion creada exitosamente',
      postId: post.id,
    });
  }

  private async searchGroups(args: Record<string, unknown>): Promise<string> {
    const { query } = args as { query?: string };

    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const groups = await this.prisma.group.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        membersCount: true,
        type: true,
      },
      take: 5,
    });

    return JSON.stringify({
      success: true,
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description.substring(0, 100),
        members: g.membersCount,
        type: g.type,
      })),
      count: groups.length,
    });
  }

  private async joinGroup(userId: string, args: Record<string, unknown>): Promise<string> {
    const { groupId } = args as { groupId: string };

    if (!groupId) {
      return JSON.stringify({ success: false, error: 'ID del grupo requerido' });
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, type: true },
    });

    if (!group) {
      return JSON.stringify({ success: false, error: 'Grupo no encontrado' });
    }

    // Check if already member
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing) {
      return JSON.stringify({ success: true, message: 'Ya eres miembro de este grupo' });
    }

    // Join group
    await this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'MEMBER',
      },
    });

    await this.prisma.group.update({
      where: { id: groupId },
      data: { membersCount: { increment: 1 } },
    });

    return JSON.stringify({
      success: true,
      message: `Te has unido al grupo "${group.name}"`,
    });
  }

  private async searchEvents(args: Record<string, unknown>): Promise<string> {
    const { query } = args as { query?: string };

    const where: Record<string, unknown> = {
      startDate: { gte: new Date() }, // Only future events
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const events = await this.prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        location: true,
        isOnline: true,
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });

    return JSON.stringify({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description.substring(0, 100),
        date: e.startDate.toISOString(),
        location: e.location || (e.isOnline ? 'En linea' : 'Por definir'),
      })),
      count: events.length,
    });
  }

  private async registerToEvent(userId: string, args: Record<string, unknown>): Promise<string> {
    const { eventId } = args as { eventId: string };

    if (!eventId) {
      return JSON.stringify({ success: false, error: 'ID del evento requerido' });
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, maxAttendees: true, _count: { select: { attendances: true } } },
    });

    if (!event) {
      return JSON.stringify({ success: false, error: 'Evento no encontrado' });
    }

    // Check if already registered
    const existing = await this.prisma.eventAttendance.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing) {
      return JSON.stringify({ success: true, message: 'Ya estas registrado en este evento' });
    }

    // Check capacity
    if (event._count.attendances >= event.maxAttendees) {
      return JSON.stringify({ success: false, error: 'El evento ha alcanzado su capacidad maxima' });
    }

    // Register
    await this.prisma.eventAttendance.create({
      data: {
        eventId,
        userId,
        confirmed: false,
      },
    });

    return JSON.stringify({
      success: true,
      message: `Te has registrado al evento "${event.title}"`,
    });
  }

  // ===== Conversation management =====

  async getConversations(userId: string) {
    const conversations = await this.prisma.tutorConversation.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: { content: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map(
      (c: {
        id: string;
        title: string | null;
        createdAt: Date;
        updatedAt: Date;
        messages: { content: string; createdAt: Date }[];
      }) => ({
        id: c.id,
        title: c.title,
        lastMessage: c.messages[0]?.content.substring(0, 50) || null,
        updatedAt: c.updatedAt,
      }),
    );
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.tutorConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    return conversation;
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.tutorConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    await this.prisma.tutorConversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversacion eliminada' };
  }
}
