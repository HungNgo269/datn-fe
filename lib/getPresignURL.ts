import { PresignedUrlResponse } from "@/app/feature/books/types/books.type";
import { handleRequest } from "./handleApiRequest";
import { axiosClient } from "./api";

export async function getPresignedUrl(filename: string, type: string) {
  return handleRequest<PresignedUrlResponse>(() =>
    axiosClient.post("/storage/presigned-url", { filename, type })
  );
}
