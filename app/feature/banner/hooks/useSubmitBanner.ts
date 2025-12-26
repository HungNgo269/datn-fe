import { useCloudUpload } from "@/app/share/hook/useCloudUpload";
import { createBanner, updateBanner } from "../api/banner.api";
import { BannerFormValues, BannerPayload } from "../schema/banner.schema";
import { useState } from "react";

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
      let finalImageUrl = "";
      console.log("Check data submit:", data);

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

      console.log("Payload gửi đi:", payloadWithoutId);
      let result;

      if (mode === "edit" && id) {
        result = await updateBanner(id, payloadWithoutId);
        console.log("Update Success:", result);
      } else {
        const createPayload = { ...payloadWithoutId, id };
        result = await createBanner(createPayload);
        console.log("Create Success:", result);
      }
      setStatusMessage("Thành công!");
      return { success: true, data: result };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu banner";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitBanner, isSubmitting, statusMessage, error };
}
