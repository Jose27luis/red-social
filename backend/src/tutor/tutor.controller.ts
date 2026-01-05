import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TutorService } from './tutor.service';
import { SendTutorMessageDto } from './dto';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string };
}

@ApiTags('tutor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Enviar un mensaje al tutor IA' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado y respuesta recibida' })
  @ApiResponse({ status: 400, description: 'Solicitud invalida o limite de mensajes excedido' })
  async sendMessage(@Request() req: AuthenticatedRequest, @Body() dto: SendTutorMessageDto) {
    return this.tutorService.sendMessage(req.user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Obtener todas las conversaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones' })
  async getConversations(@Request() req: AuthenticatedRequest) {
    return this.tutorService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener una conversacion con sus mensajes' })
  @ApiResponse({ status: 200, description: 'Conversacion con mensajes' })
  @ApiResponse({ status: 404, description: 'Conversacion no encontrada' })
  async getConversation(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tutorService.getConversation(req.user.id, id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Eliminar una conversacion' })
  @ApiResponse({ status: 200, description: 'Conversacion eliminada' })
  @ApiResponse({ status: 404, description: 'Conversacion no encontrada' })
  async deleteConversation(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tutorService.deleteConversation(req.user.id, id);
  }
}
