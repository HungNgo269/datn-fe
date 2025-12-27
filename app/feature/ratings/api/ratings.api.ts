import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";
import {
  CreateRatingDto,
  RatingResponseDto,
  RatingStatsResponseDto,
  RatingSummaryResponseDto,
  RatingWithUserResponseDto,
  UpdateRatingDto,
} from "../types/rating.type";

// POST /books/{bookId}/rating: Rate a book
export async function createBookRating(
  bookId: number,
  payload: CreateRatingDto
) {
  return handleRequest<RatingResponseDto>(() =>
    axiosClient.post(`/books/${bookId}/rating`, payload)
  );
}

// PATCH /books/{bookId}/rating: Update your rating
export async function updateBookRating(
  bookId: number,
  payload: UpdateRatingDto
) {
  return handleRequest<RatingResponseDto>(() =>
    axiosClient.patch(`/books/${bookId}/rating`, payload)
  );
}

// DELETE /books/{bookId}/rating: Delete your rating
export async function deleteBookRating(bookId: number) {
  return handleRequest<boolean>(() =>
    axiosClient.delete(`/books/${bookId}/rating`)
  );
}

// GET /books/{bookId}/rating: Get stats and current user rating
export async function getBookRatingStats(bookId: number) {
  return handleRequest<RatingStatsResponseDto>(() =>
    axiosClient.get(`/books/${bookId}/rating`)
  );
}

// GET /books/{bookId}/rating/summary: Get summary with distribution
export async function getBookRatingSummary(bookId: number) {
  return handleRequest<RatingSummaryResponseDto>(() =>
    axiosClient.get(`/books/${bookId}/rating/summary`)
  );
}

// GET /books/{bookId}/ratings: Get all ratings of a book (Paginated)
export async function getBookRatings(
  bookId: number,
  params: { page: number; limit: number; sort?: string }
) {
  return handlePaginatedRequest<RatingWithUserResponseDto>(() =>
    axiosClient.get(`/books/${bookId}/ratings`, { params })
  );
}

// GET /ratings/me: Get my rating for a book (Theo Image 2)
// Lưu ý: API này trong ảnh của bạn có query param hoặc body để xác định book nào không?
// Nếu endpoint chỉ là /ratings/me thì có thể nó trả về list các sách user đã rate,
// nhưng thường sẽ là /ratings/me?bookId=...
export async function getMyRatingForBook(params: { bookId: number }) {
  return handleRequest<RatingResponseDto | null>(() =>
    axiosClient.get("/ratings/me", { params })
  );
}
