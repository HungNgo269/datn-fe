"use server";

import { revalidatePath } from "next/cache";
import { Book, CreateBookDto, PresignedUrlResponse } from "../types/books.type";
import { config } from "@/app/config/env.config";


export async function getPresignedUrl(
  filename: string,
  type: string,
  token: string
) {
  try {
    const response = await fetch(`${config.backendURL}/storage/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filename, type }),
      // credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    const result = await response.json();
    return { success: true, data: result.data as PresignedUrlResponse };
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    return { success: false, error: "Failed to get upload URL" };
  }
}

export async function createBook(data: CreateBookDto, token: string) {
  try {
    console.log("check CreateBookDto", data);

    const response = await fetch(`${config.backendURL}/admin/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    console.log("check res", response);
    if (!response) {
      throw new Error("Failed to create book");
    }

    const book = await response.json();

    revalidatePath("/books");

    return { success: true, data: book as Book };
  } catch (error) {
    console.error("Error creating book:", error);
    return { success: false, error: "Failed to create book" };
  }
}

export async function uploadFileToCloud(uploadUrl: string, file: File) {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Upload to cloud failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error uploading to cloud:", error);
    return { success: false, error: "Failed to upload file" };
  }
}
