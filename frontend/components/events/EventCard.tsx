'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Event } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  UserPlus,
  UserMinus,
  Eye,
} from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const isAttending = event.attendees?.some((a) => a.userId === user?.id) || false;
  const isOrganizer = event.organizerId === user?.id;

  const attendMutation = useMutation({
    mutationFn: () => eventsApi.attend(event.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
    },
  });

  const unattendMutation = useMutation({
    mutationFn: () => eventsApi.unattend(event.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
    },
  });

  const handleAttendToggle = () => {
    if (isAttending) {
      unattendMutation.mutate();
    } else {
      attendMutation.mutate();
    }
  };

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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {event.description}
            </p>
          </div>
          {isOrganizer && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              Organizador
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.startDate)}
            {event.endDate && event.startDate !== event.endDate && (
              <> - {formatDate(event.endDate)}</>
            )}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(event.startDate)}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {event.attendeesCount || 0} asistentes
            {event.maxAttendees && ` / ${event.maxAttendees}`}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/events/${event.id}`)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>

          {!isOrganizer && (
            <Button
              size="sm"
              onClick={handleAttendToggle}
              disabled={attendMutation.isPending || unattendMutation.isPending}
              variant={isAttending ? 'outline' : 'default'}
              className="flex-1"
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
        </div>
      </CardContent>
    </Card>
  );
}
