export enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN',
  ALUMNI = 'ALUMNI',
}

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  UNIVERSITY_ONLY = 'UNIVERSITY_ONLY',
  PRIVATE = 'PRIVATE',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  career?: string;
  profilePicture?: string;
  bio?: string;
  interests: string[];
  privacyLevel: PrivacyLevel;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
  followersCount?: number; // Alias for _count.followers
  followingCount?: number; // Alias for _count.following
  followers?: Array<{ followerId: string }>; // For profile page
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  career?: string;
  profilePicture?: string;
  bio?: string;
  interests: string[];
  privacyLevel: PrivacyLevel;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  followers: User[];
  following: User[];
  posts: unknown[];
  groups: unknown[];
  followersCount?: number;
  followingCount?: number;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  department?: string;
  career?: string;
  profilePicture?: string;
  bio?: string;
  interests?: string[];
  privacyLevel?: PrivacyLevel;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}
