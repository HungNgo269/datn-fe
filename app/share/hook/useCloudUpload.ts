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
      console.log("folder", folder);
      const presigned = await getPresignedUrl(file.name, folder);
      console.log("file.name", file.name);

      await uploadFileToCloud(presigned.uploadUrl, file);
      console.log("presigned.key", presigned.key);

      return presigned.key;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}
