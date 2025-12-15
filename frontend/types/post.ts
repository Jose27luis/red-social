import { User } from './user';

export enum PostType {
  QUESTION = 'QUESTION',
  DISCUSSION = 'DISCUSSION',
  RESOURCE = 'RESOURCE',
  EVENT = 'EVENT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export interface Post {
  id: string;
  content: string;
  type: PostType;
  images: string[];
  likesCount: number;
  commentsCount: number;
  isEdited: boolean;
  groupId?: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  group?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  likes?: Like[];
  hasLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface CreatePostDto {
  content: string;
  type: PostType;
  images?: string[];
  groupId?: string;
}

export interface UpdatePostDto {
  content?: string;
  images?: string[];
}

export interface CreateCommentDto {
  content: string;
}

export interface PaginatedPosts {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
