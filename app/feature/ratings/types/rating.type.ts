export interface UserSummaryDto {
  id: number;
  username: string;
  avatar: string | null;
}

export interface RatingResponseDto {
  id: number;
  userId: number;
  bookId: number;
  score: number;
  review?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingDto {
  score: number;
  review?: string;
}

export interface UpdateRatingDto {
  score?: number;
  review?: string;
}

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export type RatingDistributionDto = Record<RatingScore, number>;

export interface RatingStatsResponseDto {
  averageRating: number;
  ratingCount: number;
  userRating?: RatingResponseDto | null;
}

export interface RatingSummaryResponseDto {
  averageRating: number;
  ratingCount: number;
  distribution: RatingDistributionDto;
}

export interface RatingWithUserResponseDto extends RatingResponseDto {
  user: UserSummaryDto;
}
