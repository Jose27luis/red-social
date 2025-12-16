import { User } from './user';

export enum GroupType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  INVITE_ONLY = 'INVITE_ONLY',
}

export enum GroupMemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  coverImage?: string;
  membersCount: number;
  creatorId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  members?: GroupMember[];
  posts?: unknown[];
  createdAt: string;
  updatedAt: string;
  isMember?: boolean;
  memberRole?: GroupMemberRole;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  user?: User;
  createdAt: string;
}

export interface CreateGroupDto {
  name: string;
  description: string;
  type?: GroupType;
  coverImage?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  type?: GroupType;
  coverImage?: string;
}

export interface AddMemberDto {
  userId: string;
  role?: GroupMemberRole;
}

export interface UpdateMemberRoleDto {
  role: GroupMemberRole;
}

export interface PaginatedGroups {
  data: Group[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
