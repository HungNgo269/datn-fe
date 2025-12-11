export interface Book {
  id: string;
  title: string;
  sourceKey: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}
export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface CreateBookDto {
  title: string;
  sourceKey: string;
  coverImage?: string;
}
