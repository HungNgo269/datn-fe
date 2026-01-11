"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterComments } from "./chapterComments";
import { ChapterRating } from "./chapterRating";
interface ChapterTabsProps {
  bookId: number; // <-- Nhận bookId
  children: React.ReactNode;
}

export function ChapterTabs({ bookId, children }: ChapterTabsProps) {
  return (
    <Tabs defaultValue="chapters" className="w-full">
      <TabsList className="h-auto w-full justify-start  border-b p-0">
        <TabsTrigger
          value="chapters"
          className="rounded-none border-b-2 border-transparent px-1 pb-2 text-sm font-medium text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground"
        >
          Chương truyện
        </TabsTrigger>
        <TabsTrigger
          value="comments"
          className="rounded-none border-b-2 border-transparent px-1 pb-2 text-sm font-medium text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground"
        >
          Bình luận
        </TabsTrigger>
        <TabsTrigger
          value="ratings"
          className="rounded-none border-b-2 border-transparent px-1 pb-2 text-sm font-medium text-muted-foreground transition data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground"
        >
          Đánh giá
        </TabsTrigger>
      </TabsList>

      {/* Content */}
      <TabsContent value="chapters" className="mt-2">
        {children}
      </TabsContent>
      <TabsContent value="comments" className="mt-2">
        <ChapterComments />
      </TabsContent>

      {/* TabsContent mặc định chỉ render children khi active.
          Nên useQuery bên trong ChapterRating sẽ chỉ chạy khi user click vào tab này.
      */}
      <TabsContent value="ratings" className="mt-2">
        <ChapterRating bookId={bookId} />
      </TabsContent>
    </Tabs>
  );
}
