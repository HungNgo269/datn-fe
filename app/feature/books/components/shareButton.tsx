"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus, Minus, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface props {
  userId?: number;
  bookId?: number;
}

export default function ShareButton({ userId, bookId }: props) {
  const [isLoading, setIsLoading] = useState(false);

  //   useEffect(() => {
  //     const check = async () => {
  //       const res = await GetBookFollowAction(userId, bookId);
  //       if (res) {
  //         setFollowed(true);
  //       }
  //     };
  //     check();
  //   }, [userId, bookId]);

  //   const handleClick = async () => {
  //     setIsLoading(true);
  //     try {
  //       if (followed) {
  //         await RemoveBookFollowAction(userId, bookId);
  //         setFollowed(false);
  //       } else {
  //         await AddBookFollowAction(userId, bookId);
  //         setFollowed(true);
  //       }
  //     } catch (error) {
  //       toast.error("something is wrong, try again");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  return (
    <Button
      className="h-full hover:cursor-pointer text-lg px-14 w-full  rounded-sm border border-border"
      disabled={isLoading}
      onClick={() => {
        // handleClick();
      }}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Share className="mr-1.5 h-5 w-5" strokeWidth={2.5} />
      )}
      Chia sẻ cuốn sách
    </Button>
  );
}
