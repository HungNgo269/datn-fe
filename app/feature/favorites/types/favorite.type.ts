export interface FavoriteBookSummaryDto {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  description: string | null;
}

export interface FavoriteResponseDto {
  id: number;
  userId: number;
  bookId: number;
  book: FavoriteBookSummaryDto;
  createdAt: string;
}

export interface FavoriteStatusResponseDto {
  isFavorited: boolean;
  totalFavorites: number;
}

export interface FavoriteCountResponseDto {
  totalFavorites: number;
}
