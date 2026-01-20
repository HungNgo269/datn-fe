"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, ThumbsUp } from "lucide-react";

// Dữ liệu giả
const MOCK_COMMENTS = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    content: "Truyện hay quá, mong ra chương mới sớm!",
    date: "2 giờ trước",
    likes: 12,
  },
  {
    id: 2,
    user: "Trần B",
    content: "Main bị bạo thật, nhưng diễn biến hơi nhanh.",
    date: "5 giờ trước",
    likes: 5,
  },
  {
    id: 3,
    user: "User C",
    content: "Đoạn cuối chương trước hơi khó hiểu nhỉ?",
    date: "1 ngày trước",
    likes: 2,
  },
];

export function ChapterComments() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-2">
          <Textarea
            placeholder="Viết bình luận của bạn..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button size="sm" className="gap-2">
              <Send className="h-4 w-4" /> Gửi
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_COMMENTS.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-4 rounded-lg bg-muted/30 p-4"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{comment.user}</span>
                <span className="text-xs text-muted-foreground">
                  {comment.date}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{comment.content}</p>

              <div className="mt-2 flex items-center gap-4 pt-2">
                <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
                  <ThumbsUp className="h-3 w-3" /> {comment.likes}
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
                  <MessageSquare className="h-3 w-3" /> Phản hồi
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
