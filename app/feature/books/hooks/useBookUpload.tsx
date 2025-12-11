"use client";

import { useState } from "react";
import {
  createBook,
  getPresignedUrl,
  uploadFileToCloud,
} from "../actions/books.action";
import { useTokenStore } from "@/app/store/useTokenStore";

export function useBookUpload() {
  const token = useTokenStore.getState().token;
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uploadBook = async (file: File, title: string) => {
    setIsUploading(true);
    setError(null);
    setProgress("Getting upload URL...");

    try {
      const presignedResult = await getPresignedUrl(file.name, "book", token!);
      console.log("check presignedResult", presignedResult);
      if (!presignedResult.success || !presignedResult.data) {
        throw new Error(presignedResult.error || "Failed to get upload URL");
      }

      setProgress("Uploading file...");

      const uploadResult = await uploadFileToCloud(
        presignedResult.data.uploadUrl,
        file
      );
      console.log(" uploadFileToCloud", uploadResult);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload file");
      }

      setProgress("Creating book record...");

      const createResult = await createBook(
        {
          title,
          sourceKey: presignedResult.data.key,
          coverImage: "",
        },
        token!
      );

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error || "Failed to create book");
      }

      setProgress("Complete!");
      return { success: true, data: createResult.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadBook, isUploading, progress, error };
}
