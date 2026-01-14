import { getPresignedUrl } from "@/app/share/api/share.api";
import { NextRequest } from "next/server";

const CACHE_SECONDS = 60 * 60 * 24 * 365;

export async function GET(request: NextRequest) {
  const rawFilename = request.nextUrl.searchParams.get("key");

  if (!rawFilename) {
    return new Response("Missing filename", { status: 400 });
  }

  let filename = rawFilename;

  try {
    filename = decodeURIComponent(rawFilename);
  } catch {
    filename = rawFilename;
  }

  filename = filename.replace(/^\/+/, "");
  if (filename.startsWith("uploads/")) {
    filename = filename.slice("uploads/".length);
  }

  try {
    const parts = filename.split("/");
    let folderType = "cover";

    if (parts.length > 1) {
      const rawType = parts[parts.length - 2];
      if (rawType.includes("cover")) folderType = "cover";
      if (rawType.includes("avatar")) folderType = "avatar";
      if (rawType.includes("book")) folderType = "book";
    }

    const response = await getPresignedUrl(filename, folderType);

    if (!response || !response.uploadUrl) {
      console.error("Presigned URL Response Error:", response);
      return new Response("Could not get presigned URL from Backend", {
        status: 502,
      });
    }
    const presignedUrl = response.uploadUrl;

    const imageResponse = await fetch(presignedUrl);
    if (!imageResponse.ok) {
      return new Response("Image not found on Storage", { status: 404 });
    }

    return new Response(imageResponse.body, {
      headers: {
        "Content-Type":
          imageResponse.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
      },
    });
  } catch (error) {
    console.error("Proxy Image Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
