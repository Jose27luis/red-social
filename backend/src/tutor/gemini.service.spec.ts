import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('deberia advertir cuando GEMINI_API_KEY no esta configurada', () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      (configService.get as jest.Mock).mockReturnValue(undefined);

      service.onModuleInit();

      expect(loggerWarnSpy).toHaveBeenCalledWith('GEMINI_API_KEY not configured. Tutor IA will not be available.');
    });

    it('deberia inicializar el modelo cuando GEMINI_API_KEY esta configurada', () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');
      (configService.get as jest.Mock).mockReturnValue('test-api-key');

      service.onModuleInit();

      expect(loggerLogSpy).toHaveBeenCalledWith('Gemini service initialized successfully');
    });
  });

  describe('buildSystemPrompt', () => {
    it('deberia construir prompt basico sin carrera', () => {
      const prompt = service.buildSystemPrompt();

      expect(prompt).toContain('Eres un tutor academico');
      expect(prompt).toContain('UNAMAD');
      expect(prompt).not.toContain('El estudiante cursa');
    });

    it('deberia incluir la carrera cuando se proporciona', () => {
      const prompt = service.buildSystemPrompt('Ingenieria de Sistemas');

      expect(prompt).toContain('Ingenieria de Sistemas');
      expect(prompt).toContain('Adapta tus respuestas academicas');
    });
  });

  describe('isAvailable', () => {
    it('deberia retornar false cuando el modelo no esta inicializado', () => {
      expect(service.isAvailable()).toBe(false);
    });

    it('deberia retornar true cuando el modelo esta inicializado', () => {
      (configService.get as jest.Mock).mockReturnValue('test-api-key');
      service.onModuleInit();

      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('chat', () => {
    it('deberia lanzar error cuando el modelo no esta inicializado', async () => {
      await expect(service.chat('test', [], 'prompt')).rejects.toThrow('Gemini service not initialized');
    });
  });

  describe('continueWithFunctionResults', () => {
    it('deberia lanzar error cuando el modelo no esta inicializado', async () => {
      await expect(service.continueWithFunctionResults('test', [], [], 'prompt')).rejects.toThrow(
        'Gemini service not initialized',
      );
    });
  });
});
