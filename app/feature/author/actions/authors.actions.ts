import { PaginatedData } from "@/app/types/api.types";
import { handleActionPaginatedRequest } from "@/lib/handleActionRequest";

import { AuthorInfo } from "../types/authors.types";

interface SearchAuthorsParams {
  query?: string;
  page?: number;
  limit?: number;
}

const getEmptyResult = (
  limit: number,
  page: number
): PaginatedData<AuthorInfo> => ({
  data: [],
  meta: {
    page,
    limit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

export async function searchAuthorsAction({
  query,
  page = 1,
  limit = 6,
}: SearchAuthorsParams): Promise<PaginatedData<AuthorInfo>> {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return getEmptyResult(limit, page);
  }

  const params = new URLSearchParams();
  params.append("q", normalizedQuery);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const url = `/authors/search?${params.toString()}`;

  return handleActionPaginatedRequest<AuthorInfo>(url, { revalidate: 0 });
}

