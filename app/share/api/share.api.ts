import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";
import { PresignedUrlResponse } from "../types/share.types";

export async function getPresignedUrl(filename: string, type: string) {
  return handleRequest<PresignedUrlResponse>(() =>
    axiosClient.post("/storage/presigned-url", { filename, type })
  );
}
