import { PaginatedData } from "@/app/types/api.types";
import {
  handleActionPaginatedRequest,
  handleActionRequest,
} from "@/lib/handleActionRequest";

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

export async function getAuthorsAction({
  page = 1,
  limit = 12,
}: {
  page?: number;
  limit?: number;
}): Promise<PaginatedData<AuthorInfo>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const url = `/authors?${params.toString()}`;

  return handleActionPaginatedRequest<AuthorInfo>(url, {
    revalidate: 3600,
  });
}

export async function getAuthorBySlugAction(slug: string) {
  if (!slug) {
    throw new Error("Author slug is required");
  }

  return handleActionRequest<AuthorInfo>(`/authors/slug/${slug}`, {
    revalidate: 3600,
  });
}
