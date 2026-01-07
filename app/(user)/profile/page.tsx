import type { Metadata } from "next";
import { AccountProfilePanel } from "@/app/feature/account/components/account-profile-panel";

export const metadata: Metadata = { title: "Profile | NextBook" };

export default function AccountProfilePage() {
  return <AccountProfilePanel />;
}
