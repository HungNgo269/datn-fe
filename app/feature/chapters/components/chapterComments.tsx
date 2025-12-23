"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ThumbsUp, MessageSquare } from "lucide-react";

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
    content: "Main bá đạo thật, nhưng diễn biến hơi nhanh.",
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
      {/* Input Section */}
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex-1 gap-2 flex flex-col">
          <Textarea
            placeholder="Viết bình luận của bạn..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button size="sm" className="gap-2">
              <Send className="w-4 h-4" /> Gửi
            </Button>
          </div>
        </div>
      </div>

      {/* List Comments */}
      <div className="space-y-4">
        {MOCK_COMMENTS.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-4 p-4 bg-muted/30 rounded-lg"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{comment.user}</span>
                <span className="text-xs text-muted-foreground">
                  {comment.date}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{comment.content}</p>

              <div className="flex items-center gap-4 mt-2 pt-2">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="w-3 h-3" /> {comment.likes}
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="w-3 h-3" /> Phản hồi
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
