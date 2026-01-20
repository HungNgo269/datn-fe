import type { Metadata } from "next";
import { FavoriteBooksSection } from "@/app/feature/favorites/components/FavoriteBooksSection";

export const metadata: Metadata = { title: "Favorites | NextBook" };

export default function FavouriteBookPage() {
  return <FavoriteBooksSection />;
}
