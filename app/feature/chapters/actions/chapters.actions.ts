"use server";

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
  chapterSlug: string,
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return handleActionRequest<ChapterContent>(
    `/books/${bookSlug}/chapters/${chapterSlug}`,
    {
      next: { revalidate: 3600 },
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    },
  );
}

export async function getChaptersContent(url: string) {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Không thể tải nội dung sách: ${res.status}`);
  }
  return res.text();
}

export async function createChapter(slug: string, data: any) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return handleActionRequest(`/books/${slug}/chapters`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateChapter(
  slug: string,
  chapterSlug: string,
  data: any,
) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return handleActionRequest(`/books/${slug}/chapters/${chapterSlug}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteChapter(slug: string, chapterSlug: string) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return handleActionRequest(`/books/${slug}/chapters/${chapterSlug}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function generateAudio(chapterId: number) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  return handleActionRequest(`/audio/generate/${chapterId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
