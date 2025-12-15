// App constants
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Red Académica UNAMAD';
export const UNIVERSIDAD_DOMAIN = process.env.NEXT_PUBLIC_UNIVERSIDAD_DOMAIN || '@unamad.edu.pe';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Content limits
export const MAX_POST_LENGTH = 3000;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_BIO_LENGTH = 500;
export const MAX_IMAGES_PER_POST = 10;
export const MAX_INTERESTS = 10;

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// Query keys for React Query
export const QUERY_KEYS = {
  // Auth
  ME: ['auth', 'me'],

  // Users
  USERS: ['users'],
  USER: (id: string) => ['users', id],
  USER_PROFILE: (id: string) => ['users', 'profile', id],
  FOLLOWERS: (id: string) => ['users', id, 'followers'],
  FOLLOWING: (id: string) => ['users', id, 'following'],
  IS_FOLLOWING: (id: string) => ['users', id, 'is-following'],

  // Posts
  POSTS: ['posts'],
  POST: (id: string) => ['posts', id],
  POST_LIKED: (id: string) => ['posts', id, 'liked'],

  // Groups
  GROUPS: ['groups'],
  GROUP: (id: string) => ['groups', id],
  MY_GROUPS: ['groups', 'my'],
  GROUP_MEMBER: (id: string) => ['groups', id, 'is-member'],
  GROUP_POSTS: ['groups', 'posts'],
  USER_POSTS: ['users', 'posts'],

  // Events
  EVENTS: ['events'],
  EVENT: (id: string) => ['events', id],
  MY_EVENTS: ['events', 'my'],

  // Messages
  CONVERSATIONS: ['messages', 'conversations'],
  CONVERSATION: (userId: string) => ['messages', 'conversation', userId],
  UNREAD_MESSAGES: ['messages', 'unread-count'],

  // Resources
  RESOURCES: ['resources'],
  RESOURCE: (id: string) => ['resources', id],

  // Notifications
  NOTIFICATIONS: ['notifications'],
  UNREAD_NOTIFICATIONS: ['notifications', 'unread-count'],

  // Feed
  FEED: ['feed'],
};

// Role labels
export const ROLE_LABELS = {
  STUDENT: 'Estudiante',
  PROFESSOR: 'Profesor',
  ADMIN: 'Administrador',
  ALUMNI: 'Egresado',
};

// Post type labels
export const POST_TYPE_LABELS = {
  QUESTION: 'Pregunta',
  DISCUSSION: 'Discusión',
  RESOURCE: 'Recurso',
  EVENT: 'Evento',
  ANNOUNCEMENT: 'Anuncio',
};

// Group type labels
export const GROUP_TYPE_LABELS = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
  INVITE_ONLY: 'Solo por invitación',
};

// Privacy level labels
export const PRIVACY_LEVEL_LABELS = {
  PUBLIC: 'Público',
  UNIVERSITY_ONLY: 'Solo universidad',
  PRIVATE: 'Privado',
};

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// File upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png', 'zip'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
