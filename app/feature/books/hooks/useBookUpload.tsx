"use client";

import { useState } from "react";
import { createBook, getPresignedUrl, updateBook } from "../api/books.api";
import { CreateBookDto } from "../types/books.type";
import { uploadFileToCloud } from "../helper";
import { BookFormState } from "@/app/feature/books-upload/schema/uploadBookSchema";

interface UploadProgress {
  stage: "cover" | "file" | "saving" | "complete";
  message: string;
}

export function useBookUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitBook = async (data: BookFormState, mode: "create" | "edit") => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      let coverImageKey = data.currentCoverKey || "";

      if (data.cover instanceof File) {
        setProgress({ stage: "cover", message: "Đang upload ảnh bìa mới..." });
        const coverPresigned = await getPresignedUrl(data.cover.name, "cover");
        await uploadFileToCloud(coverPresigned.uploadUrl, data.cover);
        coverImageKey = coverPresigned.key;
      }

      let sourceKey = data.currentSourceKey || "";

      if (data.file instanceof File) {
        setProgress({ stage: "file", message: "Đang upload file sách mới..." });
        const filePresigned = await getPresignedUrl(data.file.name, "book");
        await uploadFileToCloud(filePresigned.uploadUrl, data.file);
        sourceKey = filePresigned.key;
      }

      setProgress({ stage: "saving", message: "Đang lưu thông tin sách..." });

      const bookPayload: CreateBookDto = {
        title: data.title,
        slug: data.slug,
        sourceKey: sourceKey,
        coverImage: coverImageKey,
        authorIds: data.authorIds,
        categoryIds: data.categoryIds,
        description: data.description ?? "",
        price: data.price ?? 0,
        freeChapters: data.freeChapters ?? 0,
      };

      let result;
      if (mode === "create") {
        result = await createBook(bookPayload);
      } else {
        if (!data.id) throw new Error("Thiếu Book ID khi cập nhật");
        result = await updateBook(data.id, bookPayload);
      }

      setProgress({ stage: "complete", message: "Thành công!" });
      return { success: true, data: result };
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    submitBook,
    isUploading,
    progress,
    error,
  };
}
