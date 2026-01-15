export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface BookPurchaseStatus {
  purchased: boolean;
}

export interface PurchasedBookSummary {
  id: number;
  title: string;
  slug: string;
  coverImage?: string | null;
  price?: number | string | null;
  accessType?: string | null;
}

export interface BookPurchase {
  id: number;
  bookId: number;
  price: number | string;
  purchasedAt: string;
  book: PurchasedBookSummary;
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "INCOMPLETE"
  | "TRIALING";

export interface UserSubscription {
  id: number;
  plan: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
