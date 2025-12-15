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
}

export interface UserProfile extends User {
  followers: User[];
  following: User[];
  posts: any[];
  groups: any[];
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
