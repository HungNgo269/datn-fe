import { Crown, ShoppingBag } from "lucide-react";
import { toNumericPrice } from "@/lib/helper";

interface BadgeInfo {
  label: string | null;
  isMembership: boolean;
}

/**
 * Format price to Vietnamese currency format
 */
function formatPrice(price: number | string | null | undefined): string {
  const numericPrice = toNumericPrice(price);
  if (numericPrice === 0) return "Miễn phí";
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice).replace('₫', 'đ');
}

/**
 * Compute badge information from book access type and price
 */
export function getBookBadge(
  accessType?: string,
  price?: number | string | null
): BadgeInfo {
  const priceValue = toNumericPrice(price);
  const normalizedAccessType = accessType?.toString().toUpperCase();

  const isMembership = normalizedAccessType === "MEMBERSHIP";
  const isFree = normalizedAccessType === "FREE";
  const requiresPayment =
    normalizedAccessType === "PURCHASE" || (!isFree && priceValue > 0);

  let label = null;
  if (isMembership) {
    label = "HỘI VIÊN";
  } else if (requiresPayment) {
    label = formatPrice(price);
  }

  return { label, isMembership };
}

interface BookBadgeProps {
  accessType?: string;
  price?: number | string | null;
  size?: "sm" | "lg";
  isOnPromotion?: boolean;
  discountPercent?: number;
}

/**
 * Reusable badge component for book cards
 */
export function BookBadge({ accessType, price, size = "lg", isOnPromotion, discountPercent }: BookBadgeProps) {
  if (isOnPromotion && discountPercent && discountPercent > 0) {
    const originalPrice = toNumericPrice(price);
    const finalPrice = originalPrice * (1 - discountPercent / 100);

    const percentSize = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-sm px-2 py-1";
    const priceSize = size === "sm" ? "text-[8px]" : "text-[10px]";
    const finalPriceSize = size === "sm" ? "text-[10px]" : "text-[12px]";

    return (
      <div className="absolute top-0 right-0 z-10 flex shadow-md rounded-bl-xl overflow-hidden font-sans">
        <div className={`bg-[#a3e635] text-[#1a2e05] font-black flex items-center justify-center tracking-tighter ${percentSize}`}>
          -{discountPercent}%
        </div>
        
        <div className="bg-[#374151]/95 backdrop-blur-sm px-2 py-0.5 flex flex-col items-end justify-center leading-none min-w-[60px]">
          <span className={`${priceSize} text-gray-400 line-through decoration-gray-400/80 decoration-1 opacity-80`}>
            {formatPrice(originalPrice)}
          </span>
          <span className={`${finalPriceSize} font-bold text-[#a3e635] mt-0.5`}>
            {formatPrice(finalPrice)}
          </span>
        </div>
      </div>
    );
  }

  const { label, isMembership } = getBookBadge(accessType, price);

  if (!label) return null;

  const sizeClasses = size === "sm" 
    ? "px-2 py-1 text-[11px]" 
    : "px-3 py-1 text-[10px]";

  return (
    <div
      className={`
        absolute top-0 right-0 z-10
        flex items-center gap-1.5 pl-3 pr-1 py-1
        rounded-full shadow-sm border border-white/20
        ${
          isMembership
            ? "bg-gradient-to-r from-orange-400 to-amber-600 shadow-orange-500/30"
            : "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30"
        }
        transition-all duration-300 hover:scale-105 hover:shadow-md
        ${sizeClasses}
      `}
    >
      <span className="font-black uppercase tracking-wider text-white leading-none pt-0.5">
        {label}
      </span>

      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-sm">
        {isMembership ? (
          <Crown className="w-3 h-3 text-amber-500" strokeWidth={3} />
        ) : (
          <ShoppingBag className="w-3 h-3 text-rose-500" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}
