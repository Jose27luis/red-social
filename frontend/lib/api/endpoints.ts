import api from './axios';
import {
  LoginDto,
  RegisterDto,
  LoginResponse,
  User,
  UpdateUserDto,
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  Post,
  PaginatedPosts,
  CreateGroupDto,
  UpdateGroupDto,
  Group,
  PaginatedGroups,
  GroupMemberRole,
  CreateEventDto,
  UpdateEventDto,
  Event,
  PaginatedEvents,
  SendMessageDto,
  Message,
  Conversation,
  CreateResourceDto,
  Resource,
  PaginatedResources,
  PaginatedNotifications,
  PaginationParams,
  SearchParams,
} from '@/types';

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authApi = {
  login: (data: LoginDto) => api.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterDto) => api.post<LoginResponse>('/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post<LoginResponse>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),

  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),

  getMe: () => api.get<User>('/auth/me'),
};

// ============================================================================
// USERS ENDPOINTS
// ============================================================================

export const usersApi = {
  getUsers: (params?: PaginationParams) =>
    api.get<User[]>('/users', { params }),

  searchUsers: (params: SearchParams) =>
    api.get<User[]>('/users/search', { params }),

  getUserById: (id: string) => api.get<User>(`/users/${id}`),

  // Alias for consistency
  getById: (id: string) => api.get<User>(`/users/${id}`),

  getUserProfile: (id: string) => api.get<User>(`/users/profile/${id}`),

  updateProfile: (data: UpdateUserDto) =>
    api.put<User>('/users/profile', data),

  // Alias for consistency
  update: (id: string, data: UpdateUserDto) =>
    api.put<User>(`/users/${id}`, data),

  deleteAccount: () => api.delete('/users/account'),

  deleteAccountPermanent: () => api.delete('/users/account/permanent'),

  followUser: (id: string) => api.post(`/users/${id}/follow`),

  // Alias for consistency
  follow: (id: string) => api.post(`/users/${id}/follow`),

  unfollowUser: (id: string) => api.delete(`/users/${id}/follow`),

  // Alias for consistency
  unfollow: (id: string) => api.delete(`/users/${id}/follow`),

  getFollowers: (id: string, params?: PaginationParams) =>
    api.get<User[]>(`/users/${id}/followers`, { params }),

  getFollowing: (id: string, params?: PaginationParams) =>
    api.get<User[]>(`/users/${id}/following`, { params }),

  isFollowing: (id: string) =>
    api.get<{ isFollowing: boolean }>(`/users/${id}/is-following`),

  uploadProfilePicture: (formData: FormData) =>
    api.post<User>('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// ============================================================================
// POSTS ENDPOINTS
// ============================================================================

export const postsApi = {
  getPosts: (params?: PaginationParams & { type?: string; authorId?: string }) =>
    api.get<PaginatedPosts>('/posts', { params }),

  // Alias for consistency
  getAll: (params?: PaginationParams & { type?: string; authorId?: string }) =>
    api.get<PaginatedPosts>('/posts', { params }),

  getPostById: (id: string) => api.get<Post>(`/posts/${id}`),

  createPost: (data: CreatePostDto) => api.post<Post>('/posts', data),

  // Alias for consistency
  create: (data: CreatePostDto) => api.post<Post>('/posts', data),

  updatePost: (id: string, data: UpdatePostDto) =>
    api.put<Post>(`/posts/${id}`, data),

  // Alias for consistency
  update: (id: string, data: UpdatePostDto) =>
    api.put<Post>(`/posts/${id}`, data),

  deletePost: (id: string) => api.delete(`/posts/${id}`),

  // Alias for consistency
  delete: (id: string) => api.delete(`/posts/${id}`),

  likePost: (id: string) => api.post(`/posts/${id}/like`),

  // Alias for consistency
  like: (id: string) => api.post(`/posts/${id}/like`),

  unlikePost: (id: string) => api.delete(`/posts/${id}/like`),

  // Alias for consistency
  unlike: (id: string) => api.delete(`/posts/${id}/like`),

  isLiked: (id: string) => api.get<{ liked: boolean }>(`/posts/${id}/liked`),

  createComment: (id: string, data: CreateCommentDto) =>
    api.post(`/posts/${id}/comments`, data),

  deleteComment: (commentId: string) =>
    api.delete(`/posts/comments/${commentId}`),

  // Upload images for posts
  uploadImages: (formData: FormData) =>
    api.post<{ images: string[] }>('/posts/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// ============================================================================
// GROUPS ENDPOINTS
// ============================================================================

export const groupsApi = {
  getGroups: (params?: PaginationParams & { type?: string }) =>
    api.get<PaginatedGroups>('/groups', { params }),

  // Alias for consistency
  getAll: (params?: PaginationParams & { type?: string }) =>
    api.get<PaginatedGroups>('/groups', { params }),

  getMyGroups: () => api.get<Group[]>('/groups/my-groups'),

  getGroupById: (id: string) => api.get<Group>(`/groups/${id}`),

  // Alias for consistency
  getById: (id: string) => api.get<Group>(`/groups/${id}`),

  // Get group posts
  getPosts: (id: string, params?: PaginationParams) =>
    api.get<PaginatedPosts>(`/groups/${id}/posts`, { params }),

  createGroup: (data: CreateGroupDto) => api.post<Group>('/groups', data),

  // Alias for consistency
  create: (data: CreateGroupDto) => api.post<Group>('/groups', data),

  updateGroup: (id: string, data: UpdateGroupDto) =>
    api.put<Group>(`/groups/${id}`, data),

  // Alias for consistency
  update: (id: string, data: UpdateGroupDto) =>
    api.put<Group>(`/groups/${id}`, data),

  deleteGroup: (id: string) => api.delete(`/groups/${id}`),

  // Alias for consistency
  delete: (id: string) => api.delete(`/groups/${id}`),

  joinGroup: (id: string) => api.post(`/groups/${id}/join`),

  // Alias for consistency
  join: (id: string) => api.post(`/groups/${id}/join`),

  leaveGroup: (id: string) => api.delete(`/groups/${id}/leave`),

  // Alias for consistency
  leave: (id: string) => api.delete(`/groups/${id}/leave`),

  addMember: (id: string, userId: string, role?: GroupMemberRole) =>
    api.post(`/groups/${id}/members`, { userId, role }),

  removeMember: (id: string, userId: string) =>
    api.delete(`/groups/${id}/members/${userId}`),

  updateMemberRole: (id: string, userId: string, role: GroupMemberRole) =>
    api.put(`/groups/${id}/members/${userId}/role`, { role }),

  isMember: (id: string) =>
    api.get<{ isMember: boolean }>(`/groups/${id}/is-member`),
};

// ============================================================================
// EVENTS ENDPOINTS
// ============================================================================

export const eventsApi = {
  getEvents: (params?: PaginationParams & { includeAll?: boolean }) =>
    api.get<PaginatedEvents>('/events', { params }),

  // Alias for consistency
  getAll: (params?: PaginationParams & { includeAll?: boolean }) =>
    api.get<PaginatedEvents>('/events', { params }),

  getMyEvents: () => api.get<Event[]>('/events/my-events'),

  getEventById: (id: string) => api.get<Event>(`/events/${id}`),

  // Alias for consistency
  getById: (id: string) => api.get<Event>(`/events/${id}`),

  createEvent: (data: CreateEventDto) => api.post<Event>('/events', data),

  // Alias for consistency
  create: (data: CreateEventDto) => api.post<Event>('/events', data),

  updateEvent: (id: string, data: UpdateEventDto) =>
    api.put<Event>(`/events/${id}`, data),

  // Alias for consistency
  update: (id: string, data: UpdateEventDto) =>
    api.put<Event>(`/events/${id}`, data),

  deleteEvent: (id: string) => api.delete(`/events/${id}`),

  // Alias for consistency
  delete: (id: string) => api.delete(`/events/${id}`),

  attendEvent: (id: string) => api.post(`/events/${id}/attend`),

  // Alias for consistency
  attend: (id: string) => api.post(`/events/${id}/attend`),

  cancelAttendance: (id: string) => api.delete(`/events/${id}/attend`),

  // Alias for consistency
  unattend: (id: string) => api.delete(`/events/${id}/attend`),

  confirmAttendance: (id: string, qrCode: string) =>
    api.post(`/events/${id}/confirm`, { qrCode }),

  // Upload cover image
  uploadCover: (formData: FormData) =>
    api.post<{ coverImage: string }>('/events/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// ============================================================================
// MESSAGES ENDPOINTS
// ============================================================================

export const messagesApi = {
  sendMessage: (data: SendMessageDto) => api.post<Message>('/messages', data),

  getConversations: () => api.get<Conversation[]>('/messages/conversations'),

  getConversation: (userId: string, params?: PaginationParams) =>
    api.get<Message[]>(`/messages/conversation/${userId}`, { params }),

  markConversationAsRead: (userId: string) =>
    api.patch(`/messages/conversation/${userId}/read`),

  deleteMessage: (messageId: string) =>
    api.delete(`/messages/${messageId}`),

  getUnreadCount: () => api.get<{ count: number }>('/messages/unread-count'),
};

// ============================================================================
// RESOURCES ENDPOINTS
// ============================================================================

export const resourcesApi = {
  getResources: (params?: PaginationParams) =>
    api.get<PaginatedResources>('/resources', { params }),

  // Alias for consistency
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResources>('/resources', { params }),

  getResourceById: (id: string) => api.get<Resource>(`/resources/${id}`),

  // Alias for consistency
  getById: (id: string) => api.get<Resource>(`/resources/${id}`),

  createResource: (data: CreateResourceDto) =>
    api.post<Resource>('/resources', data),

  // Upload resource with FormData
  upload: (formData: FormData) =>
    api.post<Resource>('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteResource: (id: string) => api.delete(`/resources/${id}`),

  // Alias for consistency
  delete: (id: string) => api.delete(`/resources/${id}`),

  // Download resource
  download: (id: string) =>
    api.get(`/resources/${id}/download`, { responseType: 'blob' }),

  incrementDownload: (id: string) =>
    api.patch(`/resources/${id}/download`),
};

// ============================================================================
// NOTIFICATIONS ENDPOINTS
// ============================================================================

export const notificationsApi = {
  getNotifications: (params?: PaginationParams) =>
    api.get<PaginatedNotifications>('/notifications', { params }),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markAllAsRead: () => api.patch('/notifications/mark-all-read'),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// ============================================================================
// FEED ENDPOINTS
// ============================================================================

export const feedApi = {
  getFeed: (params?: PaginationParams) =>
    api.get<PaginatedPosts>('/feed', { params }),
};
