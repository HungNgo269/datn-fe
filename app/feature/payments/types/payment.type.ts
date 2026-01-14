export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface BookPurchaseStatus {
  purchased: boolean;
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
