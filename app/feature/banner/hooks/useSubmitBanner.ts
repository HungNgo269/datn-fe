import { useState } from "react";
import { useCloudUpload } from "@/app/share/hook/useCloudUpload";
import { createBanner, updateBanner } from "../api/banner.api";
import { BannerFormValues } from "../schema/banner.schema";

export function useBannerSubmit() {
  const { uploadFile } = useCloudUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitBanner = async (
    data: BannerFormValues,
    mode: "create" | "edit",
    id?: number
  ) => {
    try {
      setIsSubmitting(true);
      let finalImageUrl = "";

      if (data.imageUrl instanceof File) {
        setStatusMessage("Đang upload ảnh bìa banner ...");
        finalImageUrl = await uploadFile(data.imageUrl, "cover");
      } else if (typeof data.imageUrl === "string") {
        if (data.imageUrl.includes("/uploads/")) {
          const parts = data.imageUrl.split("/uploads/");
          finalImageUrl = "uploads/" + parts[1];
        } else {
          finalImageUrl = data.imageUrl;
        }
      }

      setStatusMessage("Đang lưu thông tin banner...");

      const payloadWithoutId = {
        title: data.title,
        description: data.description,
        linkUrl: data.linkUrl,
        position: data.position,
        startDate: data.startDate,
        endDate: data.endDate,
        order: data.order,
        isActive: data.isActive,
        imageUrl: finalImageUrl,
      };

      let result;

      if (mode === "edit" && id) {
        result = await updateBanner(id, payloadWithoutId);
      } else {
        const createPayload = { ...payloadWithoutId, id };
        result = await createBanner(createPayload);
      }
      setStatusMessage("Thành công!");
      return { success: true, data: result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu banner";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  return { submitBanner, isSubmitting, statusMessage, error };
}
