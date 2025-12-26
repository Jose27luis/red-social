'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { groupsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Group, GroupType } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, UserPlus, UserMinus, Eye, Lock } from 'lucide-react';

interface GroupCardProps {
  group: Group & { myRole?: string };
}

export default function GroupCard({ group }: GroupCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Check if user is member (from myRole if available, or from members array, or if creator)
  const isCreator = group.creatorId === user?.id || group.creator?.id === user?.id;
  const isMember = group.myRole !== undefined || group.members?.some((m) => m.userId === user?.id) || isCreator;
  const isPublic = group.type === GroupType.PUBLIC;

  const joinMutation = useMutation({
    mutationFn: () => groupsApi.join(group.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leave(group.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS });
    },
  });

  const handleJoinToggle = () => {
    if (isMember) {
      if (window.confirm('¿Estás seguro de que quieres salir de este grupo?')) {
        leaveMutation.mutate();
      }
    } else {
      joinMutation.mutate();
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{group.name}</h3>
              {!isPublic && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {group.description}
            </p>
          </div>
          {isCreator && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              Propietario
            </span>
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Users className="h-4 w-4 mr-2" />
          {group.membersCount || 0} miembros
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/groups/${group.id}`)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Grupo
          </Button>

          {!isCreator && !isMember && (
            <Button
              size="sm"
              onClick={handleJoinToggle}
              disabled={joinMutation.isPending}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Unirse
            </Button>
          )}
          {!isCreator && isMember && (
            <Button
              size="sm"
              onClick={handleJoinToggle}
              disabled={leaveMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Salir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
