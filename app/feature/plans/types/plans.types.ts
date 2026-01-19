// Enums matching Prisma schema
export enum SubscriptionPlan {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

export enum BillingInterval {
  MONTH = "MONTH",
  YEAR = "YEAR",
}

// Plan response type matching backend DTO
export interface Plan {
  id: number;
  plan: SubscriptionPlan;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  features?: string[];
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  isOnPromotion?: boolean;
  discountPercent?: number;
}

// Input types for create/update operations
export interface CreatePlanInput {
  plan: SubscriptionPlan;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  interval?: BillingInterval;
  intervalCount?: number;
  features?: string[];
  isActive?: boolean;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {}

// Query parameters
export interface QueryPlanParams {
  page: number;
  limit: number;
  isActive?: boolean;
}
