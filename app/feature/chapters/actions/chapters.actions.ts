import { ChapterCardProps, ChapterContent } from "../types/chapter.type";
import { handleActionRequest } from "@/lib/handleActionRequest";

export async function getChaptersOfBook(slug: string) {
  return handleActionRequest<ChapterCardProps[]>(`/books/${slug}/chapters`, {
    revalidate: 10,
  });
}

export async function getChaptersDetails(
  bookSlug: string,
  chapterSlug: string
) {
  return handleActionRequest<ChapterContent>(
    `/books/${bookSlug}/chapters/${chapterSlug}`,
    {
      next: { revalidate: 5 },
    }
  );
}

export async function getChaptersContent(url: string) {
  const res = await fetch(url, {
    next: { revalidate: 5 },
  });
  if (!res.ok) {
    throw new Error(`Không tải được sách: ${res.status}`);
  }
  return res.text();
}
