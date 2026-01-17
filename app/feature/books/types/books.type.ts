import { AuthorInfo } from "../../author/types/authors.types";
import { CategoryInfo } from "../../categories/types/listCategories";

export interface Book {
  id: number;
  title: string;
  slug: string;
  totalChapters: number;
  freeChapters: number;
  price?: number | string | null;
  authors: AuthorsList[];
  categories: CategoriesList[];
  sourceKey: string;
  coverImage: string;
  // status: string;
  // isActive: boolean;
  viewCount: number;
  requireLogin?: boolean;
  accessType?: string;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
export interface AuthorsList {
  bookId: number;
  categoryId: number;
  assignedAt: Date | string;
  author: AuthorInfo;
}

export interface CategoriesList {
  bookId: number;
  categoryId: 2;
  assignedAt: Date | string;
  category: CategoryInfo;
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
  description?: string | null;
  price?: number | string | null;
  accessType?: string;
  requireLogin?: boolean;
  totalChapters?: number;
  freeChapters?: number;
  authors: AuthorsList[];
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
  accessType: "FREE" | "PURCHASE" | "MEMBERSHIP";
  sourceKey?: string;
  authorIds: number[];
  categoryIds: number[];
  coverImage: string;
  description?: string;
  price?: number;
  freeChapters?: number;
}

export enum BookSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  VIEW_COUNT = "viewCount",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum AccessType {
  FREE = "free",
  PURCHASE = "purchase",
  MEMBERSHIP = "membership",
}

export interface GetBooksParams {
  search?: string;
  category?: string;
  author?: string;
  sortBy?: BookSortBy;
  sortOrder?: SortOrder;
  accessType?: AccessType;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
