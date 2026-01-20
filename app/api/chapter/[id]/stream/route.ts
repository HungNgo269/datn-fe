import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { parseHtmlForStreaming } from "@/lib/htmlStreamParser";
import type { BackendResponse } from "@/app/types/api.types";
import type { ChapterContent } from "@/app/feature/chapters/types/chapter.type";

const MIN_CHUNK_SIZE = 30 * 1024;
const MAX_CHUNK_SIZE = 50 * 1024;

function isUnsafeHost(hostname: string) {
  const blocked = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
  return blocked.has(hostname);
}

async function fetchChapterDetails(
  bookSlug: string,
  chapterSlug: string,
  accessToken?: string
): Promise<ChapterContent | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  const response = await fetch(`${apiUrl}/books/${bookSlug}/chapters/${chapterSlug}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as BackendResponse<ChapterContent>;
  if (!payload?.success) {
    return null;
  }

  return payload.data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterSlug } = await params;
  if (!chapterSlug || chapterSlug === "undefined" || chapterSlug === "null") {
    return new Response("Missing chapterSlug", { status: 400 });
  }
  const bookSlug = request.nextUrl.searchParams.get("bookSlug");
  const contentUrlParam =
    request.nextUrl.searchParams.get("contentUrl") ??
    request.nextUrl.searchParams.get("url");

  let contentUrl = contentUrlParam ?? "";

  if (!contentUrl) {
    if (!bookSlug) {
      return new Response("Missing bookSlug", { status: 400 });
    }

    const accessToken = (await cookies()).get("accessToken")?.value;
    const details = await fetchChapterDetails(bookSlug, chapterSlug, accessToken);

    if (!details?.hasAccess) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!details.contentUrl) {
      return new Response("Missing content URL", { status: 404 });
    }

    contentUrl = details.contentUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(contentUrl);
  } catch {
    return new Response("Invalid content URL", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return new Response("Unsupported URL protocol", { status: 400 });
  }

  if (isUnsafeHost(parsedUrl.hostname)) {
    return new Response("Blocked host", { status: 400 });
  }

  const htmlResponse = await fetch(parsedUrl.toString(), {
    cache: "no-store",
    signal: request.signal,
  });
  if (!htmlResponse.ok) {
    return new Response("Failed to fetch chapter content", { status: 502 });
  }

  const html = await htmlResponse.text();
  const { chunks, styles, totalBytes } = parseHtmlForStreaming(html, {
    minChunkSize: MIN_CHUNK_SIZE,
    maxChunkSize: MAX_CHUNK_SIZE,
  });

  const totalChunks = chunks.length;
  const encoder = new TextEncoder();
  let aborted = request.signal.aborted;

  request.signal.addEventListener("abort", () => {
    aborted = true;
  });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`${JSON.stringify(payload)}\n`)
        );
      };

      send({ type: "meta", totalChunks, totalBytes });

      if (styles) {
        send({ type: "styles", content: styles });
      }

      for (let index = 0; index < chunks.length; index += 1) {
        if (aborted) break;
        send({ type: "chunk", index, content: chunks[index] });
      }

      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Total-Chunks": totalChunks.toString(),
      "X-Total-Bytes": totalBytes.toString(),
      "X-Chunk-Min-Size": MIN_CHUNK_SIZE.toString(),
      "X-Chunk-Max-Size": MAX_CHUNK_SIZE.toString(),
    },
  });
}
