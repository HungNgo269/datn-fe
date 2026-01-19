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
      const accessType = data.accessType ?? "FREE";
      
      // Ensure price is always a number, never null/undefined
      let price: number;
      if (accessType === "PURCHASE") {
        // For PURCHASE, price must be > 0
        price = data.price ?? 0;
        if (price < 1) {
          throw new Error("Sách trả phí phải có giá lớn hơn 0 VND");
        }
      } else {
        // For FREE and MEMBERSHIP, always 0
        price = 0;
      }
      
      const bookPayload: CreateBookDto = {
        title: data.title,
        slug: data.slug,
        accessType: accessType,
        sourceKey: sourceKey,
        coverImage: coverImageKey,
        authorIds: data.authorIds,
        categoryIds: data.categoryIds,
        description: data.description ?? "",
        price: price,
        // Only include freeChapters for MEMBERSHIP and PURCHASE types
        freeChapters: accessType === "FREE" ? 0 : (data.freeChapters ?? 0),
      };

      console.log("📤 Book Payload being sent:", JSON.stringify(bookPayload, null, 2));

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
