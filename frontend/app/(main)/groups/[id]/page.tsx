'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { groupsApi, postsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';
import { Post, CreatePostDto, PostType, ApiError } from '@/types';
import PostCard from '@/components/feed/PostCard';
import {
  Users,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Trash2,
  Lock,
  Globe,
  Send,
} from 'lucide-react';
import { AxiosError } from 'axios';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const groupId = params.id;

  const [postContent, setPostContent] = useState('');
  const [postError, setPostError] = useState('');

  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: [QUERY_KEYS.GROUPS, groupId],
    queryFn: () => groupsApi.getById(groupId),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: [QUERY_KEYS.GROUP_POSTS, groupId],
    queryFn: () => groupsApi.getPosts(groupId),
  });

  const joinMutation = useMutation({
    mutationFn: () => groupsApi.join(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS, groupId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => groupsApi.leave(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS, groupId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => groupsApi.delete(groupId),
    onSuccess: () => {
      router.push('/groups');
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.create(data),
    onSuccess: () => {
      setPostContent('');
      setPostError('');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUP_POSTS, groupId] });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al crear la publicación';
      setPostError(typeof message === 'string' ? message : message[0]);
    },
  });

  if (groupLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const group = groupData?.data;
  if (!group) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Grupo no encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  const posts = postsData?.data?.data || [];
  const isMember = group.members?.some((m) => m.userId === user?.id) || false;
  const isOwner = group.ownerId === user?.id;

  const handleJoinToggle = () => {
    if (isMember) {
      if (window.confirm('¿Estás seguro de que quieres salir de este grupo?')) {
        leaveMutation.mutate();
      }
    } else {
      joinMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.')) {
      deleteGroupMutation.mutate();
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!postContent.trim()) {
      setPostError('El contenido no puede estar vacío');
      return;
    }

    if (postContent.length > 3000) {
      setPostError('El contenido no puede exceder 3000 caracteres');
      return;
    }

    createPostMutation.mutate({
      content: postContent.trim(),
      type: PostType.DISCUSSION,
      groupId: groupId,
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      {/* Group Info Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                {group.isPublic ? (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-muted-foreground mb-4">{group.description}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                {group.membersCount || 0} miembros
              </div>
            </div>

            <div className="flex space-x-2">
              {!isOwner && (
                <Button
                  onClick={handleJoinToggle}
                  disabled={joinMutation.isPending || leaveMutation.isPending}
                  variant={isMember ? 'outline' : 'default'}
                >
                  {isMember ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Salir del Grupo
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Unirse al Grupo
                    </>
                  )}
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Grupo
                </Button>
              )}
            </div>
          </div>

          {/* Owner Info */}
          {group.owner && (
            <div
              className="flex items-center space-x-3 p-3 rounded-lg bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => router.push(`/profile/${group.owner?.id}`)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.owner.profilePicture} />
                <AvatarFallback>
                  {getInitials(group.owner.firstName, group.owner.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Propietario</p>
                <p className="font-medium">
                  {group.owner.firstName} {group.owner.lastName}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Post (only for members) */}
      {isMember && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCreatePost}>
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>
                    {user ? getInitials(user.firstName, user.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Comparte algo con el grupo..."
                    className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    disabled={createPostMutation.isPending}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {postContent.length}/3000
                    </span>
                    <Button
                      type="submit"
                      disabled={createPostMutation.isPending || !postContent.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
                    </Button>
                  </div>

                  {postError && (
                    <p className="text-sm text-destructive">{postError}</p>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Group Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Publicaciones del Grupo</h2>
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isMember ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Únete al grupo para ver las publicaciones.
              </p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No hay publicaciones aún. ¡Sé el primero en publicar!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Members List */}
      {isMember && group.members && group.members.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Miembros ({group.members.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => router.push(`/profile/${member.user?.id}`)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.profilePicture} />
                    <AvatarFallback>
                      {getInitials(member.user?.firstName, member.user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.user?.firstName} {member.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.role === 'ADMIN' ? 'Administrador' : 'Miembro'}
                    </p>
                  </div>
                  {member.userId === group.ownerId && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                      Propietario
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
