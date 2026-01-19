// Promotion types - aligned with backend Prisma schema

export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT";
export type PromotionScope = "BOOK" | "SUBSCRIPTION";
export type PromotionDuration = "ONCE" | "REPEATING" | "FOREVER";

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  code?: string;
  type: PromotionType;
  value: number;
  scope: PromotionScope;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;

  // Subscription specific
  duration?: PromotionDuration;
  durationInMonths?: number;

  // Configuration
  applyToAllBooks?: boolean;
  applyToAllPlans?: boolean;

  // Limits
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
  usedCount?: number;

  createdAt: string;
  updatedAt: string;

  // Relations
  books?: { bookId: number }[];
  plans?: { planId: number }[];
}

export interface BookPromotion {
  bookId: number;
  promotionId: number;
  book: {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    price: number;
    authors?: {
      author: {
        id: number;
        name: string;
        slug: string;
      };
    }[];
  };
  promotion?: Promotion;
}

export interface PlanPromotion {
  planId: number;
  promotionId: number;
  plan: {
    id: number;
    name: string;
    price: number;
    currency: string;
    interval: string;
    intervalCount: number;
  };
  promotion?: Promotion;
}

// DTO for creating promotion - Book scope
export interface CreateBookPromotionDto {
  name: string;
  description?: string;
  code?: string;
  scope: "BOOK";
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  priority: number;
  applyToAllBooks?: boolean;
  bookIds?: number[];
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
}

// DTO for creating promotion - Subscription scope
export interface CreatePlanPromotionDto {
  name: string;
  description?: string;
  code?: string;
  scope: "SUBSCRIPTION";
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  priority: number;
  duration?: PromotionDuration;
  durationInMonths?: number;
  applyToAllPlans?: boolean;
  planIds?: number[];
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
}

// Union type for any promotion DTO
export type CreatePromotionDto = CreateBookPromotionDto | CreatePlanPromotionDto;

// Update DTO  
export type UpdatePromotionDto = Partial<CreatePromotionDto>;

// Calculated price result from backend
export interface CalculatedPrice {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  promotion: Promotion | null;
}

export interface BookWithPrice {
  bookId: number;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  promotion: Promotion | null;
}

export interface PlanWithPrice {
  planId: number;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  promotion: Promotion | null;
}
