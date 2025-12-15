import { User } from './user';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees: number;
  isOnline: boolean;
  qrCode?: string;
  coverImage?: string;
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  attendances?: EventAttendance[];
  _count?: {
    attendances: number;
  };
  createdAt: string;
  updatedAt: string;
  isAttending?: boolean;
  isOrganizer?: boolean;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  confirmed: boolean;
  user?: User;
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees?: number;
  isOnline?: boolean;
  coverImage?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  maxAttendees?: number;
  isOnline?: boolean;
  coverImage?: string;
}

export interface ConfirmAttendanceDto {
  qrCode: string;
}

export interface PaginatedEvents {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
