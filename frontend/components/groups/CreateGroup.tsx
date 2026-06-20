'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { groupsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { ApiError, GroupType } from '@/types';
import { Plus } from 'lucide-react';

export default function CreateGroup() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', isPublic: true });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; description: string; type: GroupType }) =>
      groupsApi.create(data),
    onSuccess: () => {
      setIsOpen(false);
      setFormData({ name: '', description: '', isPublic: true });
      setError('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS });
    },
    onError: (err: AxiosError<ApiError>) => {
      const message = err.response?.data?.message || 'Error al crear el grupo';
      setError(typeof message === 'string' ? message : message[0]);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" />
          Crear grupo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Nombre del grupo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
              maxLength={100}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Descripción <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px] w-full resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
              maxLength={500}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="isPublic" className="cursor-pointer text-sm font-medium">
              Grupo público (cualquiera puede unirse)
            </label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? 'Creando...' : 'Crear grupo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
