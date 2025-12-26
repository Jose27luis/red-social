'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { groupsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { ApiError, GroupType } from '@/types';
import { Plus, X } from 'lucide-react';

export default function CreateGroup() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; description: string; type: GroupType }) => groupsApi.create(data),
    onSuccess: () => {
      setIsOpen(false);
      setFormData({
        name: '',
        description: '',
        isPublic: true,
      });
      setError('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al crear el grupo';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('El nombre y la descripción son requeridos');
      return;
    }

    createGroupMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.isPublic ? GroupType.PUBLIC : GroupType.PRIVATE,
    });
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Crear Nuevo Grupo
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Crear Nuevo Grupo</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setError('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Nombre del Grupo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del grupo"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Descripción <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el propósito del grupo..."
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              maxLength={500}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
              Grupo público (cualquiera puede unirse)
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              type="submit"
              disabled={createGroupMutation.isPending}
              className="flex-1"
            >
              {createGroupMutation.isPending ? 'Creando...' : 'Crear Grupo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
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
