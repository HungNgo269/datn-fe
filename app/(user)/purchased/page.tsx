import type { Metadata } from "next";
import { PurchasedBooksSection } from "@/app/feature/account/components/purchasedBooksSection";

export const metadata: Metadata = { title: "Purchased | NextBook" };

export default function PurchasedPage() {
  return <PurchasedBooksSection />;
}
