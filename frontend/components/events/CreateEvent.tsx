'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { ApiError, CreateEventDto } from '@/types';
import { Plus, X, ImagePlus, Loader2 } from 'lucide-react';

export default function CreateEvent() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxAttendees: '',
  });

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventDto) => eventsApi.create(data),
    onSuccess: () => {
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        maxAttendees: '',
      });
      setCoverImage(null);
      setCoverPreview(null);
      setError('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al crear el evento';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.startDate) {
      setError('Todos los campos obligatorios deben estar completos');
      return;
    }

    try {
      let coverImageUrl: string | undefined;

      // Subir imagen si hay
      if (coverImage) {
        setIsUploading(true);
        const imageFormData = new FormData();
        imageFormData.append('image', coverImage);

        const uploadResponse = await eventsApi.uploadCover(imageFormData);
        coverImageUrl = uploadResponse.data.coverImage;
        setIsUploading(false);
      }

      const eventData: CreateEventDto = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        coverImage: coverImageUrl,
      };

      createEventMutation.mutate(eventData);
    } catch {
      setIsUploading(false);
      setError('Error al subir la imagen');
    }
  };

  const isLoading = createEventMutation.isPending || isUploading;

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Crear Nuevo Evento
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Crear Nuevo Evento</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setError('');
              removeImage();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Image */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Imagen de Portada
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />
            {coverPreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden group">
                <Image
                  src={coverPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Agregar imagen de portada</span>
              </button>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título del evento"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={200}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Descripción <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el evento..."
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              maxLength={2000}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Ubicación <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Lugar del evento"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={200}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Fecha y Hora de Inicio <span className="text-destructive">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Fecha y Hora de Fin
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Máximo de Asistentes (Opcional)
            </label>
            <input
              type="number"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
              placeholder="Dejar vacío para ilimitado"
              min="1"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Subiendo imagen...' : 'Creando...'}
                </>
              ) : (
                'Crear Evento'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setError('');
                removeImage();
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
