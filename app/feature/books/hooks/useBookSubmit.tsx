import { useState } from "react";
import { createBook, updateBook } from "../api/books.api";
import { CreateBookDto } from "../types/books.type";
import { BookFormState } from "@/app/feature/books-upload/schema/uploadBookSchema";
import { useCloudUpload } from "@/app/share/hook/useCloudUpload";

export function useBookSubmit() {
  const { uploadFile } = useCloudUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitBook = async (data: BookFormState, mode: "create" | "edit") => {
    setIsSubmitting(true);
    setError(null);

    try {
      let coverImageKey = data.currentCoverKey || "";
      let sourceKey = data.currentSourceKey || "";

      if (data.cover instanceof File) {
        setStatusMessage("Đang upload ảnh bìa...");
        coverImageKey = await uploadFile(data.cover, "cover");
      }

      if (data.file instanceof File) {
        setStatusMessage("Đang upload file sách...");
        sourceKey = await uploadFile(data.file, "book");
      }

      setStatusMessage("Đang lưu thông tin sách...");
      const bookPayload: CreateBookDto = {
        title: data.title,
        slug: data.slug,
        accessType: data.accessType ?? "FREE",
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
        if (!data.id) throw new Error("Thiếu Book ID");
        result = await updateBook(data.id, bookPayload);
      }

      setStatusMessage("Thành công!");
      return { success: true, data: result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitBook, isSubmitting, statusMessage, error };
}
