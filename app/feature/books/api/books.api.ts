import { config } from "@/app/config/env.config";
import { Book } from "../types/books.type";

export async function getBooks(): Promise<Book[]> {
  try {
    const response = await fetch(`${config.backendURL}/books`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const response = await fetch(`${config.backendURL}/books/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch book");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}
