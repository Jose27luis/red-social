'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CreateGroup from '@/components/groups/CreateGroup';
import GroupCard from '@/components/groups/GroupCard';
import { Group } from '@/types';

export default function GroupsPage() {
  const [filter, setFilter] = useState<'all' | 'my-groups'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.GROUPS,
    queryFn: () => groupsApi.getAll(),
  });

  const groups = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
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
          Error al cargar los grupos. Por favor intenta de nuevo.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Grupos</h1>
      </div>

      <CreateGroup />

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
          Todos los Grupos
        </button>
        <button
          onClick={() => setFilter('my-groups')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'my-groups'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Mis Grupos
        </button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              No hay grupos aún. ¡Crea el primero!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group: Group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
