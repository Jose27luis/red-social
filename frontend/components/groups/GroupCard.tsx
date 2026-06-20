'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { groupsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Group, GroupType } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, Lock } from 'lucide-react';

interface GroupCardProps {
  group: Group & { myRole?: string };
}

const covers = [
  'from-[#7a1340] to-[#b01e54]',
  'from-[#0d4f4a] to-[#0d9488]',
  'from-[#1e3a8a] to-[#2563eb]',
  'from-[#6b21a8] to-[#7c3aed]',
  'from-[#9a3412] to-[#ea580c]',
  'from-[#155e54] to-[#0d9488]',
];

const icons = [
  'from-[#b01e54] to-[#e23e7d]',
  'from-[#0d9488] to-[#2dd4bf]',
  'from-[#2563eb] to-[#60a5fa]',
  'from-[#7c3aed] to-[#a78bfa]',
  'from-[#ea580c] to-[#fb923c]',
  'from-[#14b8a6] to-[#5eead4]',
];

export default function GroupCard({ group }: GroupCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const isCreator = group.creatorId === user?.id || group.creator?.id === user?.id;
  const isMember =
    group.myRole !== undefined ||
    group.members?.some((member) => member.userId === user?.id) ||
    isCreator;
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

  const handleJoinToggle = (event: MouseEvent) => {
    event.preventDefault();
    if (isMember) {
      if (window.confirm('¿Estás seguro de que quieres salir de este grupo?')) {
        leaveMutation.mutate();
      }
    } else {
      joinMutation.mutate();
    }
  };

  const palette = Array.from(group.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % covers.length;
  const initials =
    group.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'G';

  return (
    <Link
      href={`/groups/${group.id}`}
      className="block overflow-hidden rounded-[15px] border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`h-[74px] bg-gradient-to-br ${covers[palette]}`} />
      <div className="px-4 pb-4">
        <span
          className={`-mt-[25px] flex h-[50px] w-[50px] items-center justify-center rounded-[13px] border-[3px] border-card bg-gradient-to-br ${icons[palette]} text-lg font-bold text-white`}
        >
          {initials}
        </span>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[15px] font-bold text-foreground">{group.name}</span>
          {!isPublic && <Lock className="h-3.5 w-3.5 flex-none text-muted-foreground" />}
        </div>
        <p className="mt-1 min-h-[38px] line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {group.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="tabular-nums">{group.membersCount || 0} miembros</span>
          </span>
          {isCreator ? (
            <span className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
              Propietario
            </span>
          ) : isMember ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleJoinToggle}
              disabled={leaveMutation.isPending}
              className="h-8"
            >
              Miembro
            </Button>
          ) : (
            <Button size="sm" onClick={handleJoinToggle} disabled={joinMutation.isPending} className="h-8">
              Unirme
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
