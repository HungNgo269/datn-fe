import { cookies } from "next/headers";
import { ChapterCardProps, ChapterContent } from "../types/chapter.type";
import { handleActionRequest } from "@/lib/handleActionRequest";

export async function getChaptersOfBook(slug: string) {
  return handleActionRequest<ChapterCardProps[]>(`/books/${slug}/chapters`, {
    cache: "no-store",
  });
}

export async function getChaptersDetails(
  bookSlug: string,
  chapterSlug: string
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return handleActionRequest<ChapterContent>(
    `/books/${bookSlug}/chapters/${chapterSlug}`,
    {
      cache: "no-store",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );
}

export async function getChaptersContent(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Không thể tải nội dung sách: ${res.status}`);
  }
  return res.text();
}
