"use client";

import { useState } from "react";
import { createBook, getPresignedUrl } from "../api/books.api";
import { BookUploadData, CreateBookDto } from "../types/books.type";
import { uploadFileToCloud } from "../helper";

interface UploadProgress {
  stage: "cover" | "file" | "saving" | "complete";
  message: string;
}

export function useBookUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadBook = async (data: BookUploadData) => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      let coverImageKey = "";
      // Upload cover image nếu có
      if (data.cover) {
        setProgress({
          stage: "cover",
          message: "Đang upload ảnh bìa...",
        });

        const coverPresigned = await getPresignedUrl(data.cover.name, "cover");
        console.log("coverPresigned", coverPresigned);

        await uploadFileToCloud(coverPresigned.uploadUrl, data.cover);
        coverImageKey = coverPresigned.key;
        console.log("coverImageKey", coverImageKey);
      }

      // Upload book file
      setProgress({
        stage: "file",
        message: "Đang upload file sách...",
      });

      const filePresigned = await getPresignedUrl(data.file.name, "book");
      await uploadFileToCloud(filePresigned.uploadUrl, data.file);

      setProgress({
        stage: "saving",
        message: "Đang lưu thông tin sách vào hệ thống...",
      });

      const bookPayload: CreateBookDto = {
        title: data.title,
        slug: data.slug,
        sourceKey: filePresigned.key,
        coverImage: coverImageKey,

        authorIds: data.authorIds,
        categoryIds: data.categoryIds,
        description: data.description ?? "",
        price: data.price ?? 0,
        freeChapters: data.freeChapters ?? 0,
        // status: data.status ?? "DRAFT",
        // isActive: data.isActive ?? true,
      };
      const result = await createBook(bookPayload);

      setProgress({
        stage: "complete",
        message: "Upload thành công!",
      });

      return { success: true, data: result };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload thất bại";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadBook,
    isUploading,
    progress,
    error,
  };
}
