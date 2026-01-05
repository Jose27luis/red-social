import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel, Content, SchemaType, Tool } from '@google/generative-ai';

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiResponse {
  text?: string;
  functionCalls?: FunctionCall[];
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly tools: Tool[];

  constructor(private readonly configService: ConfigService) {
    this.tools = this.buildTools() as Tool[];
  }

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. Tutor IA will not be available.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: this.tools,
    });

    this.logger.log('Gemini service initialized successfully');
  }

  private buildTools() {
    return [
      {
        functionDeclarations: [
          {
            name: 'searchUsers',
            description:
              'Buscar usuarios en la plataforma Red Academica UNAMAD por nombre o carrera. Usa esta funcion cuando el usuario quiera encontrar a alguien.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: 'Nombre o parte del nombre del usuario a buscar',
                },
                career: {
                  type: SchemaType.STRING,
                  description: 'Carrera del usuario (ej: Ingenieria de Sistemas, Contabilidad)',
                },
              },
            },
          },
          {
            name: 'sendMessage',
            description:
              'Enviar un mensaje directo a un usuario especifico. Usa esta funcion cuando el usuario quiera enviar un mensaje a alguien.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                userId: {
                  type: SchemaType.STRING,
                  description: 'ID del usuario destinatario',
                },
                content: {
                  type: SchemaType.STRING,
                  description: 'Contenido del mensaje a enviar',
                },
              },
              required: ['userId', 'content'],
            },
          },
          {
            name: 'searchPosts',
            description: 'Buscar publicaciones en la plataforma por palabras clave o autor.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: {
                  type: SchemaType.STRING,
                  description: 'Palabras clave para buscar en las publicaciones',
                },
                authorName: {
                  type: SchemaType.STRING,
                  description: 'Nombre del autor de las publicaciones',
                },
              },
            },
          },
          {
            name: 'createPost',
            description:
              'Crear una nueva publicacion en nombre del usuario. Usa esta funcion cuando el usuario quiera publicar algo.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                content: {
                  type: SchemaType.STRING,
                  description: 'Contenido de la publicacion',
                },
              },
              required: ['content'],
            },
          },
          {
            name: 'searchGroups',
            description: 'Buscar grupos de estudio por nombre o tema.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: {
                  type: SchemaType.STRING,
                  description: 'Nombre o tema del grupo a buscar',
                },
              },
            },
          },
          {
            name: 'joinGroup',
            description: 'Unirse a un grupo de estudio. Usa esta funcion cuando el usuario quiera unirse a un grupo.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                groupId: {
                  type: SchemaType.STRING,
                  description: 'ID del grupo al que unirse',
                },
              },
              required: ['groupId'],
            },
          },
          {
            name: 'searchEvents',
            description: 'Buscar eventos academicos por nombre o fecha.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: {
                  type: SchemaType.STRING,
                  description: 'Nombre o descripcion del evento',
                },
              },
            },
          },
          {
            name: 'registerToEvent',
            description:
              'Registrarse a un evento academico. Usa esta funcion cuando el usuario quiera asistir a un evento.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                eventId: {
                  type: SchemaType.STRING,
                  description: 'ID del evento al que registrarse',
                },
              },
              required: ['eventId'],
            },
          },
        ],
      },
    ];
  }

  buildSystemPrompt(career?: string): string {
    let prompt = [
      'Eres un tutor academico de la Universidad Nacional Amazonica de Madre de Dios (UNAMAD),',
      'integrado en la plataforma Red Academica UNAMAD.',
      '',
      'Tu rol es:',
      '1. Ayudar a estudiantes con dudas academicas de manera clara y didactica',
      '2. Realizar acciones en la plataforma cuando el usuario lo solicite',
      '',
      'Reglas importantes:',
      '- Responde siempre en espanol',
      '- Se conciso pero completo en tus explicaciones academicas',
      '- Cuando el usuario pida realizar una accion, usa las funciones disponibles',
      '- Si necesitas buscar un usuario antes de enviarle mensaje, primero busca y luego envia',
      '- Confirma las acciones realizadas de forma clara',
      '- Si no encuentras lo que el usuario busca, informalo amablemente',
    ].join('\n');

    if (career) {
      prompt += `\n\nEl estudiante cursa la carrera de ${career}. `;
      prompt += 'Adapta tus respuestas academicas a su campo de estudio cuando sea relevante.';
    }

    return prompt;
  }

  async chat(userMessage: string, history: Content[], systemPrompt: string): Promise<GeminiResponse> {
    if (!this.model) {
      throw new Error('Gemini service not initialized. Check GEMINI_API_KEY configuration.');
    }

    const chat = this.model.startChat({
      history,
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;

    // Check for function calls
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      return {
        functionCalls: functionCalls.map((fc) => ({
          name: fc.name,
          args: fc.args as Record<string, unknown>,
        })),
      };
    }

    return {
      text: response.text(),
    };
  }

  async continueWithFunctionResults(
    userMessage: string,
    history: Content[],
    functionResults: { name: string; result: string }[],
    systemPrompt: string,
  ): Promise<GeminiResponse> {
    if (!this.model) {
      throw new Error('Gemini service not initialized.');
    }

    // Build the history with function call and results
    const functionResponseParts = functionResults.map((fr) => ({
      functionResponse: {
        name: fr.name,
        response: JSON.parse(fr.result),
      },
    }));

    const chat = this.model.startChat({
      history: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: functionResponseParts },
      ],
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(
      'Continua con la respuesta basandote en los resultados de las funciones ejecutadas.',
    );
    const response = result.response;

    // Check for more function calls
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      return {
        functionCalls: functionCalls.map((fc) => ({
          name: fc.name,
          args: fc.args as Record<string, unknown>,
        })),
      };
    }

    return {
      text: response.text(),
    };
  }

  isAvailable(): boolean {
    return !!this.model;
  }
}
