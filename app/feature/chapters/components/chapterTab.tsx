"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterComments } from "./chapterComments";
import { ChapterRating } from "./chapterRating";

interface ChapterTabsProps {
  children: React.ReactNode;
}

export function ChapterTabs({ children }: ChapterTabsProps) {
  return (
    <Tabs defaultValue="chapters" className="w-full">
      <TabsList className="bg-gray-100 p-1 h-auto inline-flex">
        <TabsTrigger
          value="chapters"
          className="data-[state=active]:bg-white data-[state=active]:shadow px-6 py-2.5 text-sm font-medium"
        >
          Chương truyện
        </TabsTrigger>
        <TabsTrigger
          value="comments"
          className="data-[state=active]:bg-white data-[state=active]:shadow px-6 py-2.5 text-sm font-medium"
        >
          Bình luận
        </TabsTrigger>
        <TabsTrigger
          value="ratings"
          className="data-[state=active]:bg-white data-[state=active]:shadow px-6 py-2.5 text-sm font-medium"
        >
          Đánh giá
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chapters" className="mt-2">
        {children}
      </TabsContent>
      <TabsContent value="comments" className="mt-2">
        <ChapterComments></ChapterComments>
      </TabsContent>
      <TabsContent value="ratings" className="mt-2">
        <ChapterRating></ChapterRating>
      </TabsContent>
    </Tabs>
  );
}
