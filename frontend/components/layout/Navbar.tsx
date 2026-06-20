'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, formatDate, getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { notificationsApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  LogOut,
  Moon,
  Sun,
  User,
  CheckCheck,
  Trash2,
  Shield,
  Search,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types';

const roleLabels: Record<string, string> = {
  STUDENT: 'Estudiante',
  PROFESSOR: 'Profesor',
  ADMIN: 'Administrador',
  ALUMNI: 'Egresado',
};

export default function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const { data: unreadData } = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: () => notificationsApi.getNotifications({ limit: 10 }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = unreadData?.data?.count || 0;
  const notifications = notificationsData?.data?.data || [];
  const roleLabel = user?.role ? roleLabels[user.role] ?? user.role : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="h-[3px] bg-gradient-to-r from-[#9d1148] via-[#d6336c] to-[#f06aa0]" />
      <div className="h-[59px] flex items-center gap-4 px-5">
        <div className="flex items-center gap-3 lg:w-60 flex-none overflow-hidden">
          <div className="bg-white rounded-full p-1 shadow-sm border border-border flex-none">
            <Image
              src="/images/logounamad.svg"
              alt="UNAMAD"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-serif text-base font-bold text-foreground tracking-tight whitespace-nowrap">
              Red Académica
            </div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-primary">UNAMAD</div>
          </div>
        </div>

        <div className="relative flex-1 max-w-[560px] hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-muted-foreground" />
          <input
            aria-label="Buscar personas, grupos, recursos o eventos"
            className="w-full h-10 rounded-[10px] border border-input bg-secondary pl-10 pr-3.5 text-[13.5px] text-foreground outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-[38px] w-[38px] rounded-[9px] text-muted-foreground"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-[38px] w-[38px] rounded-[9px] text-muted-foreground"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <h3 className="font-semibold">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="text-xs h-7"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Cargando...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tienes notificaciones</p>
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      role="button"
                      tabIndex={0}
                      className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 ${
                        !notification.isRead ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={getImageUrl(notification.sender?.profilePicture)} />
                        <AvatarFallback className="text-xs">
                          {notification.sender
                            ? getInitials(notification.sender.firstName, notification.sender.lastName)
                            : 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notification.isRead && <div className="h-2 w-2 bg-primary rounded-full" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(notification.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => router.push('/notifications')}
                  >
                    Ver todas las notificaciones
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mx-1.5 h-6 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-[10px] border border-border bg-card py-1.5 pl-1.5 pr-2.5 hover:bg-secondary transition-colors">
                <Avatar className="h-[30px] w-[30px] rounded-lg">
                  <AvatarImage src={getImageUrl(user?.profilePicture)} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#b01e54] to-[#e23e7d] text-xs font-bold text-white">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-[12.5px] font-semibold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{roleLabel}</span>
                </span>
                <ChevronDown className="h-[15px] w-[15px] text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings/security')}>
                <Shield className="mr-2 h-4 w-4" />
                Seguridad
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
