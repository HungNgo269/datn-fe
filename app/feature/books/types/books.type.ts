export interface Book {
  id: number;
  title: string;
  slug: string;
  totalChapters: number;
  freeChapters: 0;
  price?: number | null;
  authors: AuthorsList[];
  categories: CategoriesList[];
  sourceKey: string;
  coverImage: string;
  // status: string;
  // isActive: boolean;
  viewCount: number;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
export interface AuthorsList {
  bookId: number;
  categoryId: 2;
  assignedAt: Date | string;
  author: AuthorInfo;
}
export interface AuthorInfo {
  id: number;
  name: string;
  slug: string;
  avatar?: null;
  bio?: string;
  isActive?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CategoriesList {
  bookId: number;
  categoryId: 2;
  assignedAt: Date | string;
  category: CategoryInfo;
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId?: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

export enum BookStatus {
  DRAFT = "DRAFT",
  PROCESSING = "PROCESSING",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
}
export interface BookCardProps {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  viewCount?: number;
  authors: string;
  price?: number;
}
export interface BookUploadData {
  file: File;
  title: string;
  slug: string;
  cover: File;
  sourceKey?: string;
  authorIds: number[];
  categoryIds: number[];
  description?: string;
  price?: number;
  freeChapters?: number;
}

export interface CreateBookDto {
  title: string;
  slug: string;
  sourceKey?: string;
  authorIds: number[];
  categoryIds: number[];
  coverImage: string;
  description?: string;
  price?: number;
  freeChapters?: number;
  // status: "DRAFT" | "PROCESSING" | "PUBLISHED" | "FAILED";
  // isActive: boolean;
}

export interface PresignedUrlResponse {
  key: string;
  uploadUrl: string;
}

export interface BookCardProps {
  id: number;
  title: string;
  authors: string;
  coverImage: string;
  price?: number;
}
