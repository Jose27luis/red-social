'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resourcesApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { ApiError, ResourceType } from '@/types';
import { Upload, X, File } from 'lucide-react';

const RESOURCE_TYPES = [
  { value: ResourceType.DOCUMENT, label: 'Documento' },
  { value: ResourceType.PRESENTATION, label: 'Presentación' },
  { value: ResourceType.SPREADSHEET, label: 'Hoja de Cálculo' },
  { value: ResourceType.VIDEO, label: 'Video' },
  { value: ResourceType.AUDIO, label: 'Audio' },
  { value: ResourceType.IMAGE, label: 'Imagen' },
  { value: ResourceType.CODE, label: 'Código' },
  { value: ResourceType.OTHER, label: 'Otro' },
];

export default function UploadResource() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    fileType: ResourceType;
  }>({
    title: '',
    description: '',
    fileType: ResourceType.DOCUMENT,
  });

  const uploadResourceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return resourcesApi.upload(data);
    },
    onSuccess: () => {
      setIsOpen(false);
      setFile(null);
      setFormData({
        title: '',
        description: '',
        fileType: ResourceType.DOCUMENT,
      });
      setError('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al subir el recurso';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!formData.title) {
        setFormData({ ...formData, title: e.target.files[0].name });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Debe seleccionar un archivo');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('El título y la descripción son requeridos');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('fileType', formData.fileType);

    uploadResourceMutation.mutate(data);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        Subir Nuevo Recurso
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Subir Nuevo Recurso</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setFile(null);
              setError('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Archivo <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-32 px-4 py-2 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-muted transition-colors"
              >
                {file ? (
                  <div className="text-center">
                    <File className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para seleccionar un archivo
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título del recurso"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={200}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Descripción <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el recurso..."
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              maxLength={1000}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Tipo de Recurso <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.fileType}
              onChange={(e) => setFormData({ ...formData, fileType: e.target.value as typeof ResourceType[keyof typeof ResourceType] })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              type="submit"
              disabled={uploadResourceMutation.isPending}
              className="flex-1"
            >
              {uploadResourceMutation.isPending ? 'Subiendo...' : 'Subir Recurso'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setFile(null);
                setError('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
