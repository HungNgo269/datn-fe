import { useState } from "react";
import { useCloudUpload } from "@/app/share/hook/useCloudUpload";
import { AuthorSubmitData } from "@/app/feature/author/schema/authorSchema";
import { createAuthor, updateAuthor } from "../api/authors.api";

export function useAuthorSubmit() {
  const { uploadFile } = useCloudUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitAuthor = async (
    data: AuthorSubmitData,
    mode: "create" | "edit"
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let avatarKey = "";

      if (data.avatar instanceof File) {
        setStatusMessage("Đang upload ảnh đại diện...");
        avatarKey = await uploadFile(data.avatar, "avatar");
      } else if (typeof data.avatar === "string") {
        avatarKey = data.avatar;
      }

      setStatusMessage("Đang lưu thông tin tác giả...");

      const payload = {
        name: data.name,
        slug: data.slug,
        bio: data.bio ?? "",
        isActive: data.isActive ?? true,
        avatar: avatarKey,
      };

      let result;
      if (mode === "create") {
        result = await createAuthor(payload);
      } else {
        if (!data.id) throw new Error("Thiếu Author ID khi cập nhật");
        result = await updateAuthor(data.id, payload);
      }

      setStatusMessage("Đang lưu thông tin tác giả...");
      return { success: true, data: result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitAuthor, isSubmitting, statusMessage, error };
}
