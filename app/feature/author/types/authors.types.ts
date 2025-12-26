export interface AuthorInfo {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
export interface CreateAuthorDto {
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
  isActive?: boolean;
}
