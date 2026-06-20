'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, messagesApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/useAuthStore';
import { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roleLabels: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Estudiante',
  [UserRole.PROFESSOR]: 'Profesor',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.ALUMNI]: 'Egresado',
};

type AdminUserUpdate = Partial<{
  firstName: string;
  lastName: string;
  department: string;
  career: string;
  role: UserRole;
  isActive: boolean;
}>;

function EditUserDialog({
  user,
  saving,
  onClose,
  onSave,
}: {
  user: User;
  saving: boolean;
  onClose: () => void;
  onSave: (data: AdminUserUpdate) => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [department, setDepartment] = useState(user.department ?? '');
  const [career, setCareer] = useState(user.career ?? '');
  const [role, setRole] = useState<UserRole>(user.role);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Apellido</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Departamento</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Carrera</label>
            <Input value={career} onChange={(e) => setCareer(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Rol</label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map((value) => (
                  <SelectItem key={value} value={value}>
                    {roleLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={saving}
            onClick={() => onSave({ firstName, lastName, department, career, role })}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MessageDialog({
  user,
  sending,
  onClose,
  onSend,
}: {
  user: User;
  sending: boolean;
  onClose: () => void;
  onSend: (content: string) => void;
}) {
  const [content, setContent] = useState('');

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Mensaje para {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <label className="text-sm font-medium">Mensaje</label>
          <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={sending || content.trim().length === 0} onClick={() => onSend(content)}>
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [messaging, setMessaging] = useState<User | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getUsers({ search: search || undefined }).then((res) => res.data),
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUserUpdate }) =>
      adminApi.updateUser(id, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditing(null);
    },
  });

  const messageMutation = useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      messagesApi.sendMessage({ receiverId, content }).then((res) => res.data),
    onSuccess: () => setMessaging(null),
  });

  if (currentUser && !isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tienes permiso para acceder a esta sección.
      </div>
    );
  }

  const users = data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Administración de usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} usuarios en el sistema` : 'Gestión de usuarios'}
        </p>
      </div>

      <div className="mb-4 space-y-1">
        <label className="text-sm font-medium">Buscar usuario</label>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                  Cargando usuarios...
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-muted-foreground">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(user)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={user.isActive ? 'destructive' : 'default'}
                      disabled={user.id === currentUser?.id || updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({ id: user.id, payload: { isActive: !user.isActive } })
                      }
                    >
                      {user.isActive ? 'Inactivar' : 'Activar'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setMessaging(user)}>
                      Mensaje
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditUserDialog
          user={editing}
          saving={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSave={(payload) => updateMutation.mutate({ id: editing.id, payload })}
        />
      )}

      {messaging && (
        <MessageDialog
          user={messaging}
          sending={messageMutation.isPending}
          onClose={() => setMessaging(null)}
          onSend={(content) => messageMutation.mutate({ receiverId: messaging.id, content })}
        />
      )}
    </div>
  );
}
