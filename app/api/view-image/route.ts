// app/api/view-image/route.ts
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storage/presigned-download?key=${encodeURIComponent(key)}`
    );
    
    if (!res.ok) {
      return new Response("Failed to get image URL", { status: 502 });
    }

    const { data } = await res.json();
    
    const imageRes = await fetch(data.url);
    
    if (!imageRes.ok) {
      return new Response("Image not found", { status: 404 });
    }
    return new Response(imageRes.body, {
      headers: {
        "Content-Type": imageRes.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}