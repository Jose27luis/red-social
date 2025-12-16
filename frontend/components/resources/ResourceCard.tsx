'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resourcesApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Resource } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const isOwner = resource.uploaderId === user?.id;

  const deleteResourceMutation = useMutation({
    mutationFn: () => resourcesApi.delete(resource.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES });
    },
  });

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
      deleteResourceMutation.mutate();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await resourcesApi.download(resource.id);
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getFileIcon = () => {
    return <FileText className="h-12 w-12 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate">{resource.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {resource.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                {resource.fileType}
              </span>
              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                {formatFileSize(resource.fileSize)}
              </span>
            </div>

            <div className="flex items-center text-xs text-muted-foreground space-x-4 mb-3">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {resource.uploader?.firstName} {resource.uploader?.lastName}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(resource.createdAt).toLocaleDateString('es-PE')}
              </div>
              <div className="flex items-center">
                <Download className="h-3 w-3 mr-1" />
                {resource.downloadCount || 0} descargas
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>

              {isOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
