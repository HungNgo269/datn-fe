import { AuthorInfo } from "../../author/types/authors.types";
import { CategoryInfo } from "../../categories/types/listCategories";

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

export enum BookSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  TITLE = "title",
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
