'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { usersApi, postsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { getInitials, getImageUrl } from '@/lib/utils';
import { ApiError, UpdateUserDto, Post } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { Pencil, Save, X, Mail, Briefcase, GraduationCap, Calendar, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user: currentUser, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    bio: currentUser?.bio || '',
    department: currentUser?.department || '',
    career: currentUser?.career || '',
  });

  // Get user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id],
    queryFn: () => usersApi.getById(currentUser!.id),
    enabled: !!currentUser?.id,
  });

  // Get user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_POSTS, currentUser?.id],
    queryFn: () => postsApi.getAll({ authorId: currentUser!.id }),
    enabled: !!currentUser?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(currentUser!.id, data),
    onSuccess: (response) => {
      setIsEditing(false);
      setError('');

      // Update auth store with new user data
      if (currentUser) {
        setAuth({
          user: response.data,
          accessToken: localStorage.getItem('accessToken') || '',
          refreshToken: localStorage.getItem('refreshToken') || '',
        });
      }

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al actualizar el perfil';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: (formData: FormData) => usersApi.uploadProfilePicture(formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id] });
      // Update auth store with new profile picture
      if (currentUser) {
        setAuth({
          user: response.data,
          accessToken: localStorage.getItem('accessToken') || '',
          refreshToken: localStorage.getItem('refreshToken') || '',
        });
      }
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

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('El nombre y apellido son requeridos');
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      bio: currentUser?.bio || '',
      department: currentUser?.department || '',
      career: currentUser?.career || '',
    });
    setError('');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getImageUrl(profile?.profilePicture)} />
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
                  title="Cambiar foto de perfil"
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

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/500
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Departamento</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Ej: Ingeniería"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Carrera</label>
                  <input
                    type="text"
                    value={formData.career}
                    onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                    placeholder="Ej: Ingeniería de Sistemas"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
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
          )}
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
        <h2 className="text-2xl font-bold mb-4">Mis Publicaciones</h2>
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
                No has publicado nada aún.
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
