export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId?: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
