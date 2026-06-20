'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { feedApi, eventsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CreatePost from '@/components/feed/CreatePost';
import PostCard from '@/components/feed/PostCard';
import { useAuthStore } from '@/store/useAuthStore';
import { Post, PostType } from '@/types';
import { cn } from '@/lib/utils';

const filters: { label: string; value: PostType | 'ALL' }[] = [
  { label: 'Todo', value: 'ALL' },
  { label: 'Anuncios', value: PostType.ANNOUNCEMENT },
  { label: 'Discusiones', value: PostType.DISCUSSION },
  { label: 'Eventos', value: PostType.EVENT },
  { label: 'Recursos', value: PostType.RESOURCE },
];

const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export default function FeedPage() {
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<PostType | 'ALL'>('ALL');

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.FEED,
    queryFn: () => feedApi.getFeed({ page: 1, limit: 20 }),
  });

  const { data: eventsData } = useQuery({
    queryKey: ['feed-upcoming-events'],
    queryFn: () => eventsApi.getEvents({ page: 1, limit: 5 }).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        {[...new Array<undefined>(3)].map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-[11px]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
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
          Error al cargar el feed. Por favor intenta de nuevo.
        </CardContent>
      </Card>
    );
  }

  const posts: Post[] = data?.data?.data || [];
  const visiblePosts = filter === 'ALL' ? posts : posts.filter((post) => post.type === filter);

  const now = new Date();
  const upcomingEvents = (eventsData?.data ?? [])
    .filter((event) => new Date(event.startDate) >= now)
    .slice(0, 3);

  const stats = [
    { value: user?._count?.posts ?? 0, label: 'Publicaciones' },
    { value: user?._count?.followers ?? user?.followersCount ?? 0, label: 'Seguidores' },
    { value: user?._count?.following ?? user?.followingCount ?? 0, label: 'Siguiendo' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[27px] font-bold tracking-tight text-foreground">
            Feed institucional
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Lo último de tu comunidad académica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <CreatePost />

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={cn(
                  'flex h-8 items-center rounded-lg px-3.5 text-[12.5px] font-semibold transition-colors',
                  filter === item.value
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-secondary-foreground hover:bg-muted'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {visiblePosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {filter === 'ALL'
                    ? 'No hay publicaciones aún. ¡Sé el primero en publicar!'
                    : 'No hay publicaciones de este tipo.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-[15px] border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 text-[13px] font-bold text-foreground">Tu actividad</div>
            <div className="grid grid-cols-2 gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[11px] border border-border bg-secondary px-3 py-2.5"
                >
                  <div className="text-xl font-bold tabular-nums tracking-tight text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[15px] border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-foreground">Próximos eventos</span>
              <Link href="/events" className="text-xs font-semibold text-primary">
                Ver todos
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">No hay eventos próximos.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event) => {
                  const date = new Date(event.startDate);
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-11 flex-none overflow-hidden rounded-[10px] border border-border bg-card text-center">
                        <div className="bg-primary py-0.5 text-[9px] font-bold tracking-wider text-primary-foreground">
                          {months[date.getMonth()]}
                        </div>
                        <div className="py-1 text-[17px] font-bold tabular-nums text-foreground">
                          {date.getDate()}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold leading-tight text-foreground">
                          {event.title}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          {event.location ? ` · ${event.location}` : ''}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
