// Resource types for categorization
export const ResourceType = {
  DOCUMENT: 'DOCUMENT',
  PRESENTATION: 'PRESENTATION',
  SPREADSHEET: 'SPREADSHEET',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  IMAGE: 'IMAGE',
  CODE: 'CODE',
  OTHER: 'OTHER',
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export interface Resource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  uploaderId: string;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDto {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface PaginatedResources {
  data: Resource[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
