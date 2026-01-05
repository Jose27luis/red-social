// Auth types
export * from './auth';

// User types
export * from './user';

// Post types
export * from './post';

// Event types
export * from './event';

// Group types
export * from './group';

// Message types
export * from './message';

// Resource types
export * from './resource';

// Notification types
export * from './notification';

// Tutor IA types
export * from './tutor';

// Common types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
}
