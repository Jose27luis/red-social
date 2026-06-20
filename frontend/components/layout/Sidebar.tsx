'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FolderOpen,
  User,
  Bot,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  pill?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const baseSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { name: 'Feed', href: '/feed', icon: Home },
      { name: 'Grupos', href: '/groups', icon: Users },
      { name: 'Eventos', href: '/events', icon: Calendar },
      { name: 'Mensajes', href: '/messages', icon: MessageSquare },
    ],
  },
  {
    title: 'Académico',
    items: [
      { name: 'Tutor IA', href: '/tutor', icon: Bot, pill: 'IA' },
      { name: 'Recursos', href: '/resources', icon: FolderOpen },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);

  const accountItems: NavItem[] = [{ name: 'Mi Perfil', href: '/profile', icon: User }];
  if (role === UserRole.ADMIN) {
    accountItems.push({ name: 'Administración', href: '/admin', icon: Shield });
  }
  const sections: NavSection[] = [...baseSections, { title: 'Cuenta', items: accountItems }];
  const mobileItems = sections.flatMap((section) => section.items).slice(0, 5);

  const renderLink = (item: NavItem) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 h-10 rounded-[10px] pl-2.5 pr-3 text-sm transition-colors border-l-[3px]',
          active
            ? 'bg-accent text-primary font-semibold border-primary'
            : 'border-transparent font-medium text-sidebar-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span className="flex-1">{item.name}</span>
        {item.pill && (
          <span className="rounded-md bg-primary px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-primary-foreground">
            {item.pill}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:pt-16 bg-sidebar border-r border-sidebar-border">
        <nav className="flex-1 overflow-y-auto px-3.5 py-4">
          {sections.map((section, index) => (
            <div key={section.title}>
              <div
                className={cn(
                  'px-2.5 pb-2 text-[10.5px] font-bold uppercase tracking-[0.13em] text-muted-foreground',
                  index === 0 ? 'pt-1' : 'pt-5'
                )}
              >
                {section.title}
              </div>
              <div className="space-y-0.5">{section.items.map(renderLink)}</div>
            </div>
          ))}
        </nav>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border">
        <div className="flex justify-around py-2">
          {mobileItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
