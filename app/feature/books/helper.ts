export async function uploadFileToCloud(
  uploadUrl: string,
  file: File
): Promise<void> {
  console.log("uploadUrl", uploadUrl);
  console.log("file", file);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  console.log("res", response);
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function validateBookFile(file: File): boolean {
  const validTypes = [".epub"];

  const fileName = file.name.toLowerCase();
  return validTypes.some((ext) => fileName.endsWith(ext));
}

export function validateImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
