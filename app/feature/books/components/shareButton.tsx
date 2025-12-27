"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Share } from "lucide-react";

export default function ShareButton() {
  const isLoading = false;

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
