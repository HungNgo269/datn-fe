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
      <TabsList className="bg-muted p-1 h-auto inline-flex">
        <TabsTrigger
          value="chapters"
          className="data-[state=active]:bg-background data-[state=active]:shadow px-6 py-2.5 text-sm font-medium"
        >
          Chương truyện
        </TabsTrigger>
        <TabsTrigger
          value="comments"
          className="data-[state=active]:bg-background data-[state=active]:shadow px-6 py-2.5 text-sm font-medium"
        >
          Bình luận
        </TabsTrigger>
        <TabsTrigger
          value="ratings"
          className="data-[state=active]:bg-background data-[state=active]:shadow px-6 py-2.5 text-sm font-medium"
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
