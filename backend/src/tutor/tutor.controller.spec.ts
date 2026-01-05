import { Test, TestingModule } from '@nestjs/testing';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';

describe('TutorController', () => {
  let controller: TutorController;
  let tutorService: jest.Mocked<TutorService>;

  const mockUser = { id: 'user-123' };
  const mockRequest = { user: mockUser } as any;

  const mockConversation = {
    id: 'conv-123',
    title: 'Test conversation',
    lastMessage: 'Hola',
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'msg-123',
    conversationId: 'conv-123',
    role: 'assistant',
    content: 'Respuesta del tutor',
    createdAt: new Date(),
  };

  const mockChatResponse = {
    conversationId: 'conv-123',
    message: mockMessage,
    actionsExecuted: 0,
  };

  beforeEach(async () => {
    const mockTutorService = {
      sendMessage: jest.fn(),
      getConversations: jest.fn(),
      getConversation: jest.fn(),
      deleteConversation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorController],
      providers: [{ provide: TutorService, useValue: mockTutorService }],
    }).compile();

    controller = module.get<TutorController>(TutorController);
    tutorService = module.get(TutorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('deberia enviar mensaje y retornar respuesta', async () => {
      const dto = { content: 'Hola tutor' };
      (tutorService.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const result = await controller.sendMessage(mockRequest, dto);

      expect(tutorService.sendMessage).toHaveBeenCalledWith('user-123', dto);
      expect(result.conversationId).toBe('conv-123');
    });

    it('deberia enviar mensaje con conversationId existente', async () => {
      const dto = { content: 'Continuar', conversationId: 'conv-123' };
      (tutorService.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const result = await controller.sendMessage(mockRequest, dto);

      expect(tutorService.sendMessage).toHaveBeenCalledWith('user-123', dto);
      expect(result.message.content).toBe('Respuesta del tutor');
    });
  });

  describe('getConversations', () => {
    it('deberia retornar lista de conversaciones', async () => {
      const mockConversations = [mockConversation];
      (tutorService.getConversations as jest.Mock).mockResolvedValue(mockConversations);

      const result = await controller.getConversations(mockRequest);

      expect(tutorService.getConversations).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
    });

    it('deberia retornar lista vacia', async () => {
      (tutorService.getConversations as jest.Mock).mockResolvedValue([]);

      const result = await controller.getConversations(mockRequest);

      expect(result).toHaveLength(0);
    });
  });

  describe('getConversation', () => {
    it('deberia retornar conversacion con mensajes', async () => {
      const mockConvWithMessages = {
        ...mockConversation,
        messages: [mockMessage],
      };
      (tutorService.getConversation as jest.Mock).mockResolvedValue(mockConvWithMessages);

      const result = await controller.getConversation(mockRequest, 'conv-123');

      expect(tutorService.getConversation).toHaveBeenCalledWith('user-123', 'conv-123');
      expect(result.id).toBe('conv-123');
    });
  });

  describe('deleteConversation', () => {
    it('deberia eliminar conversacion y retornar mensaje de exito', async () => {
      const deleteResponse = { message: 'Conversacion eliminada' };
      (tutorService.deleteConversation as jest.Mock).mockResolvedValue(deleteResponse);

      const result = await controller.deleteConversation(mockRequest, 'conv-123');

      expect(tutorService.deleteConversation).toHaveBeenCalledWith('user-123', 'conv-123');
      expect(result.message).toBe('Conversacion eliminada');
    });
  });
});
