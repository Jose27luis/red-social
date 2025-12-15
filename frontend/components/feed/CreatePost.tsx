'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { postsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { ApiError, CreatePostDto, PostType } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';

const POST_TYPES = [
  { value: PostType.QUESTION, label: 'Pregunta' },
  { value: PostType.DISCUSSION, label: 'Discusión' },
  { value: PostType.RESOURCE, label: 'Recurso' },
  { value: PostType.EVENT, label: 'Evento' },
  { value: PostType.ANNOUNCEMENT, label: 'Anuncio' },
];

export default function CreatePost() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>(PostType.DISCUSSION);
  const [error, setError] = useState('');

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.create(data),
    onSuccess: () => {
      setContent('');
      setPostType(PostType.DISCUSSION);
      setError('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al crear la publicación';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }

    if (content.length > 3000) {
      setError('El contenido no puede exceder 3000 caracteres');
      return;
    }

    createPostMutation.mutate({
      content: content.trim(),
      type: postType,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture} />
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
                disabled={createPostMutation.isPending}
              />

              <div className="flex items-center justify-between">
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as PostType)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={createPostMutation.isPending}
                >
                  {POST_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {content.length}/3000
                  </span>
                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending || !content.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
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
