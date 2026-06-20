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

const roleLabels: Record<string, string> = {
  STUDENT: 'Estudiante',
  PROFESSOR: 'Profesor',
  ADMIN: 'Administrador',
  ALUMNI: 'Egresado',
};

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

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id],
    queryFn: () => usersApi.getById(currentUser!.id),
    enabled: !!currentUser?.id,
  });

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
      if (currentUser) {
        setAuth({
          user: response.data,
          accessToken: localStorage.getItem('accessToken') || '',
          refreshToken: localStorage.getItem('refreshToken') || '',
        });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id] });
    },
    onError: (err: AxiosError<ApiError>) => {
      const message = err.response?.data?.message || 'Error al actualizar el perfil';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: (data: FormData) => usersApi.uploadProfilePicture(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, currentUser?.id] });
      if (currentUser) {
        setAuth({
          user: response.data,
          accessToken: localStorage.getItem('accessToken') || '',
          refreshToken: localStorage.getItem('refreshToken') || '',
        });
      }
    },
    onError: (err) => {
      console.error('Error al subir la foto de perfil:', err);
    },
  });

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const data = new FormData();
      data.append('file', file);
      uploadPictureMutation.mutate(data);
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
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center space-x-4">
            <Skeleton className="h-24 w-24 rounded-[24px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const profile = profileData?.data;
  const posts = postsData?.data?.data || [];
  const roleLabel = profile?.role ? roleLabels[profile.role] ?? profile.role : '';
  const subtitle = [roleLabel, profile?.career || profile?.department].filter(Boolean).join(' · ');

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-[120px] bg-gradient-to-r from-[#7a1340] via-[#b01e54] to-[#e23e7d]" />
        <div className="px-6 pb-6">
          <div className="-mt-11 flex items-end gap-4">
            <div className="relative flex-none">
              <Avatar className="h-24 w-24 rounded-[24px] border-4 border-card">
                <AvatarImage src={getImageUrl(profile?.profilePicture)} />
                <AvatarFallback className="rounded-[24px] bg-gradient-to-br from-[#b01e54] to-[#e23e7d] text-3xl font-bold text-white">
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
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                title="Cambiar foto de perfil"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 pb-1.5">
              <h1 className="text-[22px] font-bold text-foreground">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="mt-0.5 text-[13.5px] text-muted-foreground">{subtitle}</p>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="mb-1.5">
                <Pencil className="mr-2 h-4 w-4" />
                Editar perfil
              </Button>
            )}
          </div>

          <div className="mt-5 flex gap-8 border-t border-border pt-4">
            <div>
              <div className="text-xl font-bold tabular-nums text-foreground">{posts.length}</div>
              <div className="text-xs text-muted-foreground">Publicaciones</div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums text-foreground">{profile?.followersCount || 0}</div>
              <div className="text-xs text-muted-foreground">Seguidores</div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums text-foreground">{profile?.followingCount || 0}</div>
              <div className="text-xs text-muted-foreground">Siguiendo</div>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-[15px] border border-border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Apellido</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label className="text-sm font-medium">Biografía</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[100px] w-full resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/500</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Departamento</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Carrera</label>
              <input
                type="text"
                value={formData.career}
                onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-5">
            {profile?.bio && (
              <div className="rounded-[15px] border border-border bg-card p-5 shadow-sm">
                <div className="mb-2 text-sm font-bold text-foreground">Sobre mí</div>
                <p className="text-[13.5px] leading-relaxed text-foreground/80">{profile.bio}</p>
              </div>
            )}

            <div className="rounded-[15px] border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 text-sm font-bold text-foreground">Mis publicaciones</div>
              {postsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No has publicado nada aún.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[15px] border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-sm font-bold text-foreground">Información</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground">Correo institucional</div>
                  <div className="truncate text-[13px] font-semibold text-foreground">{profile?.email}</div>
                </div>
              </div>
              {profile?.department && (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">Departamento</div>
                    <div className="text-[13px] font-semibold text-foreground">{profile.department}</div>
                  </div>
                </div>
              )}
              {profile?.career && (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">Carrera</div>
                    <div className="text-[13px] font-semibold text-foreground">{profile.career}</div>
                  </div>
                </div>
              )}
              {profile?.createdAt && (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">Miembro desde</div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {new Date(profile.createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
