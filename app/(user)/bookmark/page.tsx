import type { Metadata } from "next";
import { ReaderBookmarksSection } from "@/app/feature/account/components/readerBookmarksSection";
import { ReaderNotesSection } from "@/app/feature/account/components/readerNotesSection";

export const metadata: Metadata = { title: "Bookmarks | NextBook" };

export default function AccountBookmarkPage() {
  return (
    <div className="space-y-6">
      <ReaderBookmarksSection />
      <ReaderNotesSection />
    </div>
  );
}
