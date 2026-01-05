import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { PrismaService } from '../database/prisma.service';
import { GeminiService } from './gemini.service';

describe('TutorService', () => {
  let service: TutorService;
  let prisma: jest.Mocked<PrismaService>;
  let geminiService: jest.Mocked<GeminiService>;

  const mockUser = {
    id: 'user-123',
    firstName: 'Juan',
    lastName: 'Perez',
    career: 'Ingenieria de Sistemas',
    profilePicture: null,
    isActive: true,
    isVerified: true,
  };

  const mockConversation = {
    id: 'conv-123',
    userId: 'user-123',
    title: 'Test conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  };

  const mockMessage = {
    id: 'msg-123',
    conversationId: 'conv-123',
    role: 'assistant',
    content: 'Hola, soy tu tutor academico',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      tutorConversation: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      tutorMessage: {
        create: jest.fn(),
        count: jest.fn(),
      },
      tutorActionLog: {
        create: jest.fn(),
      },
      message: {
        create: jest.fn(),
      },
      post: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      group: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      groupMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      event: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      eventAttendance: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockGeminiService = {
      isAvailable: jest.fn(),
      buildSystemPrompt: jest.fn(),
      chat: jest.fn(),
      continueWithFunctionResults: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GeminiService, useValue: mockGeminiService },
      ],
    }).compile();

    service = module.get<TutorService>(TutorService);
    prisma = module.get(PrismaService);
    geminiService = module.get(GeminiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const sendMessageDto = { content: 'Hola tutor' };

    it('deberia lanzar error cuando Gemini no esta disponible', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(false);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar error cuando el usuario no existe', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(NotFoundException);
    });

    it('deberia lanzar error cuando se excede el limite de mensajes', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.tutorMessage.count as jest.Mock).mockResolvedValue(20);

      await expect(service.sendMessage('user-123', sendMessageDto)).rejects.toThrow(BadRequestException);
    });

    it('deberia crear nueva conversacion cuando no se proporciona conversationId', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.tutorMessage.count as jest.Mock).mockResolvedValue(0);
      (prisma.tutorConversation.create as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.tutorMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (geminiService.buildSystemPrompt as jest.Mock).mockReturnValue('system prompt');
      (geminiService.chat as jest.Mock).mockResolvedValue({ text: 'Respuesta del tutor' });

      const result = await service.sendMessage('user-123', sendMessageDto);

      expect(prisma.tutorConversation.create).toHaveBeenCalled();
      expect(result.conversationId).toBe('conv-123');
    });

    it('deberia lanzar error cuando la conversacion no existe', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.tutorMessage.count as jest.Mock).mockResolvedValue(0);
      (prisma.tutorConversation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.sendMessage('user-123', { ...sendMessageDto, conversationId: 'conv-999' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deberia continuar conversacion existente', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.tutorMessage.count as jest.Mock).mockResolvedValue(0);
      (prisma.tutorConversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.tutorMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (geminiService.buildSystemPrompt as jest.Mock).mockReturnValue('system prompt');
      (geminiService.chat as jest.Mock).mockResolvedValue({ text: 'Respuesta' });

      const result = await service.sendMessage('user-123', {
        ...sendMessageDto,
        conversationId: 'conv-123',
      });

      expect(prisma.tutorConversation.findFirst).toHaveBeenCalled();
      expect(result.conversationId).toBe('conv-123');
    });

    it('deberia ejecutar function calls cuando Gemini las retorna', async () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.tutorMessage.count as jest.Mock).mockResolvedValue(0);
      (prisma.tutorConversation.create as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.tutorMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (geminiService.buildSystemPrompt as jest.Mock).mockReturnValue('system prompt');
      (geminiService.chat as jest.Mock).mockResolvedValue({
        functionCalls: [{ name: 'searchUsers', args: { name: 'Maria' } }],
      });
      (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
        text: 'Encontre a Maria',
      });

      const result = await service.sendMessage('user-123', sendMessageDto);

      expect(geminiService.continueWithFunctionResults).toHaveBeenCalled();
      expect(result.actionsExecuted).toBeGreaterThan(0);
    });
  });

  describe('getConversations', () => {
    it('deberia retornar lista de conversaciones del usuario', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Conversacion 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [{ content: 'Ultimo mensaje', createdAt: new Date() }],
        },
      ];
      (prisma.tutorConversation.findMany as jest.Mock).mockResolvedValue(mockConversations);

      const result = await service.getConversations('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conv-1');
    });

    it('deberia retornar lista vacia cuando no hay conversaciones', async () => {
      (prisma.tutorConversation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getConversations('user-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('getConversation', () => {
    it('deberia retornar conversacion con mensajes', async () => {
      const mockConvWithMessages = {
        ...mockConversation,
        messages: [mockMessage],
      };
      (prisma.tutorConversation.findFirst as jest.Mock).mockResolvedValue(mockConvWithMessages);

      const result = await service.getConversation('user-123', 'conv-123');

      expect(result.id).toBe('conv-123');
      expect(result.messages).toHaveLength(1);
    });

    it('deberia lanzar error cuando la conversacion no existe', async () => {
      (prisma.tutorConversation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getConversation('user-123', 'conv-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteConversation', () => {
    it('deberia eliminar conversacion existente', async () => {
      (prisma.tutorConversation.findFirst as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.tutorConversation.delete as jest.Mock).mockResolvedValue(mockConversation);

      const result = await service.deleteConversation('user-123', 'conv-123');

      expect(result.message).toBe('Conversacion eliminada');
      expect(prisma.tutorConversation.delete).toHaveBeenCalledWith({
        where: { id: 'conv-123' },
      });
    });

    it('deberia lanzar error cuando la conversacion no existe', async () => {
      (prisma.tutorConversation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteConversation('user-123', 'conv-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Agent Functions via sendMessage', () => {
    const setupMocksForFunctionCall = () => {
      (geminiService.isAvailable as jest.Mock).mockReturnValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.tutorMessage.count as jest.Mock).mockResolvedValue(0);
      (prisma.tutorConversation.create as jest.Mock).mockResolvedValue(mockConversation);
      (prisma.tutorMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (geminiService.buildSystemPrompt as jest.Mock).mockReturnValue('system prompt');
      (prisma.tutorActionLog.create as jest.Mock).mockResolvedValue({});
    };

    describe('searchUsers function', () => {
      it('deberia buscar usuarios por nombre', async () => {
        setupMocksForFunctionCall();
        const mockUsers = [
          { id: 'u1', firstName: 'Maria', lastName: 'Garcia', career: 'Sistemas', profilePicture: null },
        ];
        (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchUsers', args: { name: 'Maria' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Encontre a Maria Garcia',
        });

        const result = await service.sendMessage('user-123', { content: 'Busca a Maria' });

        expect(prisma.user.findMany).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia buscar usuarios por carrera', async () => {
        setupMocksForFunctionCall();
        (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchUsers', args: { career: 'Sistemas' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'No encontre usuarios',
        });

        const result = await service.sendMessage('user-123', { content: 'Busca estudiantes de Sistemas' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('sendMessage function', () => {
      it('deberia enviar mensaje directo a otro usuario', async () => {
        setupMocksForFunctionCall();
        const receiver = { id: 'u2', firstName: 'Ana', lastName: 'Lopez', isActive: true };
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser).mockResolvedValueOnce(receiver);
        (prisma.message.create as jest.Mock).mockResolvedValue({ id: 'msg-new' });
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'sendMessage', args: { userId: 'u2', content: 'Hola Ana' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Mensaje enviado a Ana',
        });

        const result = await service.sendMessage('user-123', { content: 'Envia mensaje a Ana' });

        expect(prisma.message.create).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar error cuando faltan parametros', async () => {
        setupMocksForFunctionCall();
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'sendMessage', args: {} }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Error: faltan parametros',
        });

        const result = await service.sendMessage('user-123', { content: 'Envia mensaje' });

        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar usuario no encontrado', async () => {
        setupMocksForFunctionCall();
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'sendMessage', args: { userId: 'u-invalid', content: 'Hola' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Usuario no encontrado',
        });

        const result = await service.sendMessage('user-123', { content: 'Envia mensaje' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('searchPosts function', () => {
      it('deberia buscar posts por query', async () => {
        setupMocksForFunctionCall();
        const mockPosts = [
          {
            id: 'p1',
            content: 'Post sobre programacion',
            createdAt: new Date(),
            author: { firstName: 'Luis', lastName: 'Mendez' },
          },
        ];
        (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchPosts', args: { query: 'programacion' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Encontre posts',
        });

        const result = await service.sendMessage('user-123', { content: 'Busca posts' });

        expect(prisma.post.findMany).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia buscar posts por autor', async () => {
        setupMocksForFunctionCall();
        (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchPosts', args: { authorName: 'Luis' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'No encontre posts',
        });

        const result = await service.sendMessage('user-123', { content: 'Posts de Luis' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('createPost function', () => {
      it('deberia crear una publicacion', async () => {
        setupMocksForFunctionCall();
        (prisma.post.create as jest.Mock).mockResolvedValue({ id: 'new-post' });
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'createPost', args: { content: 'Mi nueva publicacion' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Publicacion creada',
        });

        const result = await service.sendMessage('user-123', { content: 'Crea un post' });

        expect(prisma.post.create).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar error cuando no hay contenido', async () => {
        setupMocksForFunctionCall();
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'createPost', args: {} }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Error: contenido requerido',
        });

        const result = await service.sendMessage('user-123', { content: 'Crea post' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('searchGroups function', () => {
      it('deberia buscar grupos', async () => {
        setupMocksForFunctionCall();
        const mockGroups = [
          { id: 'g1', name: 'Programadores', description: 'Grupo de prog', membersCount: 10, type: 'PUBLIC' },
        ];
        (prisma.group.findMany as jest.Mock).mockResolvedValue(mockGroups);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchGroups', args: { query: 'Programadores' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Encontre grupos',
        });

        const result = await service.sendMessage('user-123', { content: 'Busca grupos' });

        expect(prisma.group.findMany).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('joinGroup function', () => {
      it('deberia unirse a un grupo', async () => {
        setupMocksForFunctionCall();
        const mockGroup = { id: 'g1', name: 'Grupo Test', type: 'PUBLIC' };
        (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
        (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.groupMember.create as jest.Mock).mockResolvedValue({});
        (prisma.group.update as jest.Mock).mockResolvedValue({});
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'joinGroup', args: { groupId: 'g1' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Te uniste al grupo',
        });

        const result = await service.sendMessage('user-123', { content: 'Uneme al grupo' });

        expect(prisma.groupMember.create).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar cuando ya es miembro', async () => {
        setupMocksForFunctionCall();
        const mockGroup = { id: 'g1', name: 'Grupo Test', type: 'PUBLIC' };
        (prisma.group.findUnique as jest.Mock).mockResolvedValue(mockGroup);
        (prisma.groupMember.findUnique as jest.Mock).mockResolvedValue({ id: 'member-1' });
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'joinGroup', args: { groupId: 'g1' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Ya eres miembro',
        });

        const result = await service.sendMessage('user-123', { content: 'Uneme al grupo' });

        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar grupo no encontrado', async () => {
        setupMocksForFunctionCall();
        (prisma.group.findUnique as jest.Mock).mockResolvedValue(null);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'joinGroup', args: { groupId: 'invalid' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Grupo no encontrado',
        });

        const result = await service.sendMessage('user-123', { content: 'Uneme al grupo' });

        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar error cuando falta groupId', async () => {
        setupMocksForFunctionCall();
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'joinGroup', args: {} }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'ID del grupo requerido',
        });

        const result = await service.sendMessage('user-123', { content: 'Uneme al grupo' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('searchEvents function', () => {
      it('deberia buscar eventos', async () => {
        setupMocksForFunctionCall();
        const mockEvents = [
          {
            id: 'e1',
            title: 'Hackathon',
            description: 'Evento de programacion',
            startDate: new Date(),
            location: 'Campus',
            isOnline: false,
          },
        ];
        (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchEvents', args: { query: 'Hackathon' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Encontre eventos',
        });

        const result = await service.sendMessage('user-123', { content: 'Busca eventos' });

        expect(prisma.event.findMany).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia mostrar eventos en linea', async () => {
        setupMocksForFunctionCall();
        const mockEvents = [
          {
            id: 'e1',
            title: 'Webinar',
            description: 'Evento online',
            startDate: new Date(),
            location: null,
            isOnline: true,
          },
        ];
        (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchEvents', args: {} }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Encontre eventos en linea',
        });

        const result = await service.sendMessage('user-123', { content: 'Eventos disponibles' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('registerToEvent function', () => {
      it('deberia registrarse a un evento', async () => {
        setupMocksForFunctionCall();
        const mockEvent = { id: 'e1', title: 'Hackathon', maxAttendees: 100, _count: { attendances: 50 } };
        (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
        (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.eventAttendance.create as jest.Mock).mockResolvedValue({});
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'registerToEvent', args: { eventId: 'e1' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Te registraste al evento',
        });

        const result = await service.sendMessage('user-123', { content: 'Registrame al evento' });

        expect(prisma.eventAttendance.create).toHaveBeenCalled();
        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar cuando ya esta registrado', async () => {
        setupMocksForFunctionCall();
        const mockEvent = { id: 'e1', title: 'Hackathon', maxAttendees: 100, _count: { attendances: 50 } };
        (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
        (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue({ id: 'att-1' });
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'registerToEvent', args: { eventId: 'e1' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Ya estas registrado',
        });

        const result = await service.sendMessage('user-123', { content: 'Registrame' });

        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar evento no encontrado', async () => {
        setupMocksForFunctionCall();
        (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'registerToEvent', args: { eventId: 'invalid' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Evento no encontrado',
        });

        const result = await service.sendMessage('user-123', { content: 'Registrame' });

        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar evento lleno', async () => {
        setupMocksForFunctionCall();
        const mockEvent = { id: 'e1', title: 'Hackathon', maxAttendees: 100, _count: { attendances: 100 } };
        (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
        (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'registerToEvent', args: { eventId: 'e1' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Evento lleno',
        });

        const result = await service.sendMessage('user-123', { content: 'Registrame' });

        expect(result.actionsExecuted).toBe(1);
      });

      it('deberia manejar error cuando falta eventId', async () => {
        setupMocksForFunctionCall();
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'registerToEvent', args: {} }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'ID del evento requerido',
        });

        const result = await service.sendMessage('user-123', { content: 'Registrame' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('unknown function', () => {
      it('deberia manejar funcion desconocida', async () => {
        setupMocksForFunctionCall();
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'unknownFunction', args: {} }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Funcion no reconocida',
        });

        const result = await service.sendMessage('user-123', { content: 'Algo' });

        expect(result.actionsExecuted).toBe(1);
      });
    });

    describe('function error handling', () => {
      it('deberia manejar errores en la ejecucion de funciones', async () => {
        setupMocksForFunctionCall();
        (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchUsers', args: { name: 'Test' } }],
        });
        (geminiService.continueWithFunctionResults as jest.Mock).mockResolvedValue({
          text: 'Error en la busqueda',
        });

        const result = await service.sendMessage('user-123', { content: 'Busca' });

        expect(result.actionsExecuted).toBe(1);
        expect(prisma.tutorActionLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ success: false }),
          }),
        );
      });
    });

    describe('multiple function calls', () => {
      it('deberia limitar el numero de function calls', async () => {
        setupMocksForFunctionCall();
        (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

        // First call returns function calls
        (geminiService.chat as jest.Mock).mockResolvedValue({
          functionCalls: [{ name: 'searchUsers', args: { name: 'Test' } }],
        });

        // Continue returns more function calls (simulating multiple iterations)
        (geminiService.continueWithFunctionResults as jest.Mock)
          .mockResolvedValueOnce({
            functionCalls: [
              { name: 'searchUsers', args: { name: 'Test2' } },
              { name: 'searchUsers', args: { name: 'Test3' } },
            ],
          })
          .mockResolvedValueOnce({
            functionCalls: [
              { name: 'searchUsers', args: { name: 'Test4' } },
              { name: 'searchUsers', args: { name: 'Test5' } },
            ],
          })
          .mockResolvedValue({ text: 'Respuesta final' });

        const result = await service.sendMessage('user-123', { content: 'Busca muchos' });

        expect(result.actionsExecuted).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
