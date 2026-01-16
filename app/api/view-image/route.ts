import { BackendResponse } from "@/app/types/api.types";
import { NextRequest } from "next/server";

const CACHE_SECONDS = 60 * 60 * 24 * 365;

export async function GET(request: NextRequest) {
  const rawFilename = request.nextUrl.searchParams.get("key");

  if (!rawFilename) {
    return new Response("Missing filename", { status: 400 });
  }

  let key = rawFilename;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!backendUrl) {
    return new Response("Backend URL is not configured", { status: 500 });
  }

  try {
    key = decodeURIComponent(rawFilename);
  } catch {
    key = rawFilename;
  }

  try {
    key = key.replace(/^\/+/, "");
    if (!key.startsWith("uploads/")) {
      key = `uploads/${key}`;
    }

    const presignedResponse = await fetch(
      `${backendUrl}/storage/presigned-download?key=${encodeURIComponent(key)}`
    );

    if (!presignedResponse.ok) {
      const errorBody = await presignedResponse.text().catch(() => "");
      console.error("Presigned URL Response Error:", {
        status: presignedResponse.status,
        body: errorBody,
      });
      return new Response("Could not get presigned URL from Backend", {
        status:
          presignedResponse.status === 401 || presignedResponse.status === 403
            ? presignedResponse.status
            : 502,
      });
    }

    const payload = (await presignedResponse.json()) as BackendResponse<{
      url: string;
    }>;
    const response = payload?.data;

    if (!payload?.success || !response?.url) {
      console.error("Presigned URL Response Error:", payload);
      return new Response("Could not get presigned URL from Backend", {
        status: 502,
      });
    }
    const presignedUrl = response.url;

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
