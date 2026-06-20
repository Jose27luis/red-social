import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

const dictionary: Record<string, string> = {
  'Access denied': 'Acceso denegado',
  'Invalid credentials': 'Credenciales inválidas',
  'User not found': 'Usuario no encontrado',
  'Group not found': 'Grupo no encontrado',
  'Event not found': 'Evento no encontrado',
  'Post not found': 'Publicación no encontrada',
  'Resource not found': 'Recurso no encontrado',
  'Comment not found': 'Comentario no encontrado',
  'Message not found': 'Mensaje no encontrado',
  'Like not found': 'Reacción no encontrada',
  'Receiver not found': 'Destinatario no encontrado',
  'Attendance not found': 'Inscripción no encontrada',
  'Attendance not found. Please register first.':
    'Inscripción no encontrada. Primero debes registrarte.',
  'Attendance already confirmed': 'La asistencia ya fue confirmada',
  'Please verify your email first': 'Primero debes verificar tu correo',
  'Your account has been deactivated': 'Tu cuenta ha sido desactivada',
  'Cannot send message to inactive or unverified user':
    'No se pueden enviar mensajes a un usuario inactivo o no verificado',
  'User with this email already exists': 'Ya existe una cuenta con este correo',
  'Invalid or expired verification token': 'El enlace de verificación es inválido o expiró',
  'Invalid QR code': 'Código QR inválido',
  'File is required': 'El archivo es obligatorio',
  'Image file is required': 'La imagen es obligatoria',
  'File size exceeds maximum of 50MB': 'El archivo supera el máximo de 50MB',
  'Maximum 10 images allowed per post': 'Se permiten máximo 10 imágenes por publicación',
  'Maximum 10 interests allowed': 'Se permiten máximo 10 intereses',
  'Bio must not exceed 500 characters': 'La biografía no debe superar 500 caracteres',
  'Comment must not exceed 1000 characters': 'El comentario no debe superar 1000 caracteres',
  'Content must not exceed 3000 characters': 'El contenido no debe superar 3000 caracteres',
  'Message must not exceed 1000 characters': 'El mensaje no debe superar 1000 caracteres',
  'Message rate limit exceeded. Please wait before sending more messages.':
    'Has alcanzado el límite de mensajes. Espera un momento antes de enviar más.',
  'New users can upload max 3 resources per day':
    'Los usuarios nuevos pueden subir máximo 3 recursos por día',
  'Posts can only be edited within 24 hours of creation':
    'Las publicaciones solo se pueden editar dentro de las 24 horas de creadas',
  'Cannot register for past events': 'No puedes inscribirte a eventos pasados',
  'Event has reached maximum capacity': 'El evento alcanzó su capacidad máxima',
  'Event start date cannot be in the past':
    'La fecha de inicio del evento no puede ser en el pasado',
  'Event end date must be after start date':
    'La fecha de fin del evento debe ser posterior a la de inicio',
  'Only event organizer can delete the event':
    'Solo el organizador puede eliminar el evento',
  'Only event organizer can update the event':
    'Solo el organizador puede actualizar el evento',
  'This group has reached its maximum capacity (100 members)':
    'Este grupo alcanzó su capacidad máxima (100 miembros)',
  'This group requires an invitation to join':
    'Este grupo requiere una invitación para unirse',
  'User is already a member of this group': 'El usuario ya es miembro de este grupo',
  'User is not a member of this group': 'El usuario no es miembro de este grupo',
  'You are already a member of this group': 'Ya eres miembro de este grupo',
  'You are not a member of this group': 'No eres miembro de este grupo',
  'You must be a member to view group posts':
    'Debes ser miembro para ver las publicaciones del grupo',
  'Only admins and moderators can add members':
    'Solo los administradores y moderadores pueden agregar miembros',
  'Only admins and moderators can remove members':
    'Solo los administradores y moderadores pueden quitar miembros',
  'Only admins can remove other admins':
    'Solo los administradores pueden quitar a otros administradores',
  'Only admins can update member roles':
    'Solo los administradores pueden actualizar los roles de los miembros',
  'Only group admins can delete the group':
    'Solo los administradores del grupo pueden eliminarlo',
  'Only group admins can update group settings':
    'Solo los administradores del grupo pueden actualizar su configuración',
  'You are already following this user': 'Ya sigues a este usuario',
  'You are not following this user': 'No sigues a este usuario',
  'You are already registered for this event': 'Ya estás inscrito en este evento',
};

function translate(message: string): string {
  if (dictionary[message]) {
    return dictionary[message];
  }
  const domain = message.match(/^Email must be from institutional domain \((.+)\)$/);
  if (domain) {
    return `El correo debe pertenecer al dominio institucional (${domain[1]})`;
  }
  if (/ not found$/.test(message)) {
    return message.replace(/ not found$/, ' no encontrado');
  }
  return message;
}

@Catch(HttpException)
export class SpanishExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      response.status(status).json({ statusCode: status, message: translate(payload) });
      return;
    }

    const body = payload as { message?: unknown };
    if (typeof body.message === 'string') {
      response.status(status).json({ ...body, message: translate(body.message) });
      return;
    }

    response.status(status).json(body);
  }
}
