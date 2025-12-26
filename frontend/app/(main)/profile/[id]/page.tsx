'use client';

import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { usersApi, postsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { Post } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Mail, Briefcase, GraduationCap, Calendar, UserPlus, UserMinus, Camera } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE, userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });

  // Get user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_POSTS, userId],
    queryFn: () => postsApi.getAll({ authorId: userId }),
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => usersApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id] });
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: (formData: FormData) => usersApi.uploadProfilePicture(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, userId] });
    },
    onError: (error) => {
      console.error('Error al subir la foto de perfil:', error);
    },
  });

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      uploadPictureMutation.mutate(formData);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = profileData?.data;
  const posts = postsData?.data?.data || [];
  const isOwnProfile = currentUser?.id === userId;
  const isFollowing = profile?.followers?.some((f) => f.followerId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.profilePicture} />
                  <AvatarFallback className="text-2xl">
                    {profile ? getInitials(profile.firstName, profile.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadPictureMutation.isPending}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {profile?.role}
                  </span>
                  {profile?.isVerified && (
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">
                      Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <Button
                onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Dejar de seguir
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Seguir
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {profile?.bio && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Biografía</h3>
                <p className="text-foreground">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {profile?.department && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Departamento
                  </h3>
                  <p className="text-foreground">{profile.department}</p>
                </div>
              )}
              {profile?.career && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Carrera
                  </h3>
                  <p className="text-foreground">{profile.career}</p>
                </div>
              )}
            </div>

            {profile?.createdAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Miembro desde
                </h3>
                <p className="text-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Publicaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{profile?.followersCount || 0}</p>
            <p className="text-sm text-muted-foreground">Seguidores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{profile?.followingCount || 0}</p>
            <p className="text-sm text-muted-foreground">Siguiendo</p>
          </CardContent>
        </Card>
      </div>

      {/* User Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Publicaciones</h2>
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
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Este usuario no ha publicado nada aún.
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
    </div>
  );
}
