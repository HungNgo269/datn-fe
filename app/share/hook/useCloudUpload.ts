import { useState } from "react";
import { getPresignedUrl } from "../api/share.api";
import { uploadFileToCloud } from "@/app/feature/books/helper";

export function useCloudUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File,
    folder: "cover" | "book" | "avatar"
  ) => {
    setIsUploading(true);
    try {
      const presigned = await getPresignedUrl(file.name, folder);
      
      await uploadFileToCloud(presigned.uploadUrl, file);

      // Return the key as-is from backend
      // Backend should return either a full public URL or a storage key
      // Do NOT strip the domain - we need the full URL for image preview
      return presigned.key;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}
