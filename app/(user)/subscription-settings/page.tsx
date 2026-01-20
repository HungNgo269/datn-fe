import type { Metadata } from "next";
import { SubscriptionSection } from "@/app/feature/account/components/subscriptionSection";

export const metadata: Metadata = { title: "Subscription settings | NextBook" };

export default function SubscriptionSettingsPage() {
  return <SubscriptionSection />;
}
