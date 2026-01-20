import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";
import type {
  BookPurchaseStatus,
  BookPurchase,
  CheckoutResponse,
  UserSubscription,
} from "../types/payment.type";

export async function createBookCheckout(bookId: number) {
  return handleRequest<CheckoutResponse>(() =>
    axiosClient.post(`/payments/book/${bookId}`)
  );
}

export async function getBookPurchaseStatus(bookId: number) {
  return handleRequest<BookPurchaseStatus>(() =>
    axiosClient.get(`/payments/book/${bookId}/check`)
  );
}

export async function getUserSubscription() {
  return handleRequest<UserSubscription | null>(() =>
    axiosClient.get("/payments/subscription")
  );
}

export async function createSubscriptionCheckout(plan: "PREMIUM") {
  return handleRequest<CheckoutResponse>(() =>
    axiosClient.post("/payments/subscription", { plan })
  );
}

export async function getUserPurchasedBooks() {
  return handleRequest<BookPurchase[]>(() =>
    axiosClient.get("/payments/purchases")
  );
}

export async function cancelUserSubscription() {
  return handleRequest<UserSubscription>(() =>
    axiosClient.post("/payments/subscription/cancel")
  );
}
