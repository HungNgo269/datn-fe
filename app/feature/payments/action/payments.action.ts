"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { BookPurchaseStatus, UserSubscription } from "../types/payment.type";
import { cookies } from "next/headers";

export async function getBookPurchaseStatusAction(bookId: number) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    
    // If no token, user definitely hasn't purchased (or we treat as guest)
    if (!accessToken) {
      return null;
    }

    return await handleActionRequest<BookPurchaseStatus>(
      `/payments/book/${bookId}/check`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    console.error("getBookPurchaseStatusAction Error:", error);
    return null;
  }
}

export async function getUserSubscriptionAction() {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return null;
    }

    return await handleActionRequest<UserSubscription | null>(
      "/payments/subscription",
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    console.error("getUserSubscriptionAction Error:", error);
    return null;
  }
}
