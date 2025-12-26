'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { postsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { ApiError, CreatePostDto, PostType } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials, getImageUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';

const POST_TYPES = [
  { value: PostType.QUESTION, label: 'Pregunta' },
  { value: PostType.DISCUSSION, label: 'Discusión' },
  { value: PostType.RESOURCE, label: 'Recurso' },
  { value: PostType.EVENT, label: 'Evento' },
  { value: PostType.ANNOUNCEMENT, label: 'Anuncio' },
];

interface CreatePostProps {
  groupId?: string;
}

export default function CreatePost({ groupId }: CreatePostProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>(PostType.DISCUSSION);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.create(data),
    onSuccess: () => {
      setContent('');
      setPostType(PostType.DISCUSSION);
      setError('');
      setSelectedImages([]);
      setPreviewUrls([]);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.GROUP_POSTS, groupId] });
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al crear la publicación';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      setError('Máximo 10 imágenes permitidas');
      return;
    }

    // Validar tamaño (5MB max por imagen)
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagen debe ser menor a 5MB');
        return false;
      }
      return true;
    });

    setSelectedImages((prev) => [...prev, ...validFiles]);

    // Crear URLs de preview
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setError('');
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const urlToRevoke = prev.at(index);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && selectedImages.length === 0) {
      setError('Agrega contenido o al menos una imagen');
      return;
    }

    if (content.length > 3000) {
      setError('El contenido no puede exceder 3000 caracteres');
      return;
    }

    try {
      let imageUrls: string[] = [];

      // Subir imágenes si hay
      if (selectedImages.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });

        const uploadResponse = await postsApi.uploadImages(formData);
        imageUrls = uploadResponse.data.images;
        setIsUploading(false);
      }

      // Crear el post
      createPostMutation.mutate({
        content: content.trim() || ' ',
        type: postType,
        images: imageUrls,
        groupId,
      });
    } catch {
      setIsUploading(false);
      setError('Error al subir las imágenes');
    }
  };

  const isLoading = createPostMutation.isPending || isUploading;

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(user?.profilePicture)} />
              <AvatarFallback>
                {user ? getInitials(user.firstName, user.lastName) : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué quieres compartir?"
                className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                disabled={isLoading}
              />

              {/* Preview de imágenes */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as PostType)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                  >
                    {POST_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {/* Botón para agregar imágenes */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || selectedImages.length >= 10}
                  >
                    <ImagePlus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Imagen</span>
                    {selectedImages.length > 0 && (
                      <span className="ml-1 text-xs">({selectedImages.length})</span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {content.length}/3000
                  </span>
                  <Button
                    type="submit"
                    disabled={isLoading || (!content.trim() && selectedImages.length === 0)}
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isUploading ? 'Subiendo...' : 'Publicando...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
