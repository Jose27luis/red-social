'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { eventsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  UserPlus,
  UserMinus,
  QrCode,
  Pencil,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const eventId = params.id;
  const [showQR, setShowQR] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EVENTS, eventId],
    queryFn: () => eventsApi.getById(eventId),
  });

  const attendMutation = useMutation({
    mutationFn: () => eventsApi.attend(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS, eventId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
    },
  });

  const unattendMutation = useMutation({
    mutationFn: () => eventsApi.unattend(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS, eventId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: () => eventsApi.delete(eventId),
    onSuccess: () => {
      router.push('/events');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  const event = data?.data;
  if (!event) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Evento no encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  const isAttending = event.attendees?.some((a) => a.userId === user?.id) || false;
  const isOrganizer = event.organizerId === user?.id;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAttendToggle = () => {
    if (isAttending) {
      unattendMutation.mutate();
    } else {
      attendMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      deleteEventMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              {isOrganizer && (
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  Organizador
                </span>
              )}
            </div>

            {isOrganizer && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/events/${eventId}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Fecha</p>
                <p className="text-muted-foreground">
                  {formatDate(event.startDate)}
                  {event.endDate && event.startDate !== event.endDate && (
                    <> - {formatDate(event.endDate)}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Hora</p>
                <p className="text-muted-foreground">{formatTime(event.startDate)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Ubicación</p>
                <p className="text-muted-foreground">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Asistentes</p>
                <p className="text-muted-foreground">
                  {event.attendeesCount || 0} confirmados
                  {event.maxAttendees ? ` (máximo ${event.maxAttendees})` : null}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Descripción</h2>
            <p className="text-foreground whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t border-border">
            {!isOrganizer && (
              <Button
                onClick={handleAttendToggle}
                disabled={attendMutation.isPending || unattendMutation.isPending}
                variant={isAttending ? 'outline' : 'default'}
              >
                {isAttending ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    No Asistiré
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Asistiré
                  </>
                )}
              </Button>
            )}

            {isAttending && (
              <Button
                variant="outline"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQR ? 'Ocultar' : 'Mostrar'} Código QR
              </Button>
            )}
          </div>

          {/* QR Code Display */}
          {showQR && isAttending && (
            <div className="mt-6 p-6 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Presenta este código QR en el evento para confirmar tu asistencia
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                {/* Note: In production, you would use a QR code library like qrcode.react */}
                <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Código de confirmación: {event.id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendees List */}
      {event.attendees && event.attendees.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Asistentes ({event.attendees.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => attendee.user && router.push(`/profile/${attendee.user.id}`)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={attendee.user?.profilePicture} />
                    <AvatarFallback>
                      {getInitials(attendee.user?.firstName, attendee.user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {attendee.user?.firstName} {attendee.user?.lastName}
                    </p>
                    {attendee.attended && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                        Confirmado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
