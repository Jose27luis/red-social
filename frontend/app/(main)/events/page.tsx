'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CreateEvent from '@/components/events/CreateEvent';
import EventCard from '@/components/events/EventCard';
import { Event } from '@/types';

export default function EventsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'all'],
    queryFn: () => eventsApi.getAll({ includeAll: true }),
  });

  const events = data?.data?.data || [];

  // Filter events based on selected filter
  const filteredEvents = events.filter((event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.startDate);

    if (filter === 'upcoming') {
      return eventDate >= now;
    } else if (filter === 'past') {
      return eventDate < now;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        {[...new Array<undefined>(3)].map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          Error al cargar los eventos. Por favor intenta de nuevo.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventos</h1>
      </div>

      <CreateEvent />

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'upcoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Próximos
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'past'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Pasados
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {filter === 'upcoming' && 'No hay eventos próximos.'}
              {filter === 'past' && 'No hay eventos pasados.'}
              {filter === 'all' && 'No hay eventos aún. ¡Crea el primero!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
