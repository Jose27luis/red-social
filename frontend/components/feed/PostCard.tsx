'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { postsApi } from '@/lib/api/endpoints';
import { SafeHTML } from '@/components/SafeHTML';
import { QUERY_KEYS } from '@/lib/constants';
import { Post, ApiError, UpdatePostDto } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { getInitials, getImageUrl } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  X,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isAuthor = user?.id === post.authorId;
  const hasLiked = post.likes?.some((like) => like.userId === user?.id) || false;

  const invalidatePostQueries = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    // If post belongs to a group, also invalidate group posts
    if (post.groupId) {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.GROUP_POSTS, post.groupId] });
    }
  };

  const updatePostMutation = useMutation({
    mutationFn: (data: UpdatePostDto) => postsApi.update(post.id, data),
    onSuccess: () => {
      setIsEditing(false);
      setError('');
      invalidatePostQueries();
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al actualizar la publicación';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => postsApi.delete(post.id),
    onSuccess: () => {
      invalidatePostQueries();
    },
  });

  const likePostMutation = useMutation({
    mutationFn: () => postsApi.like(post.id),
    onSuccess: () => {
      invalidatePostQueries();
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: () => postsApi.unlike(post.id),
    onSuccess: () => {
      invalidatePostQueries();
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      postsApi.createComment(post.id, { content }),
    onSuccess: () => {
      setCommentContent('');
      invalidatePostQueries();
    },
  });

  const handleEdit = () => {
    if (!editContent.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }

    if (editContent.length > 3000) {
      setError('El contenido no puede exceder 3000 caracteres');
      return;
    }

    updatePostMutation.mutate({ content: editContent.trim() });
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      deletePostMutation.mutate();
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      unlikePostMutation.mutate();
    } else {
      likePostMutation.mutate();
    }
  };

  const handleComment = () => {
    if (!commentContent.trim()) return;

    if (commentContent.length > 1000) {
      return;
    }

    createCommentMutation.mutate(commentContent.trim());
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(post.author?.profilePicture)} />
              <AvatarFallback>
                {post.author
                  ? getInitials(post.author.firstName, post.author.lastName)
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {post.author?.firstName} {post.author?.lastName}
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString('es-PE')}</span>
                <span>•</span>
                <span className="text-xs px-2 py-0.5 bg-muted rounded">
                  {post.type}
                </span>
              </div>
            </div>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {editContent.length}/3000
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                    setError('');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={updatePostMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {updatePostMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <SafeHTML
            content={post.content}
            level="basic"
            className="text-foreground whitespace-pre-wrap mb-4"
          />
        )}

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mb-4 grid gap-2 ${
            post.images.length === 1
              ? 'grid-cols-1'
              : post.images.length === 2
                ? 'grid-cols-2'
                : post.images.length === 3
                  ? 'grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3'
          }`}>
            {post.images.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg ${
                  post.images && post.images.length === 1
                    ? 'aspect-video'
                    : post.images.length === 3 && index === 0
                      ? 'row-span-2 aspect-square'
                      : 'aspect-square'
                }`}
              >
                <Image
                  src={getImageUrl(image) || ''}
                  alt={`Imagen ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setSelectedImage(getImageUrl(image) || null)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-6 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={hasLiked ? 'text-red-500' : ''}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${hasLiked ? 'fill-current' : ''}`}
            />
            {post.likesCount || 0}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.commentsCount || 0}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {/* Comment Input */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getImageUrl(user?.profilePicture)} />
                <AvatarFallback>
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={
                    createCommentMutation.isPending || !commentContent.trim()
                  }
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getImageUrl(comment.author?.profilePicture)} />
                      <AvatarFallback>
                        {comment.author
                          ? getInitials(
                              comment.author.firstName,
                              comment.author.lastName,
                            )
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="font-medium text-sm">
                          {comment.author?.firstName} {comment.author?.lastName}
                        </p>
                        <SafeHTML
                          content={comment.content}
                          level="strict"
                          className="text-sm text-foreground"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">
                        {new Date(comment.createdAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Imagen ampliada"
                width={1200}
                height={800}
                unoptimized
                className="object-contain max-h-[90vh] w-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
