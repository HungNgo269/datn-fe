import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Account | NextBook" };

export default function AccountIndexPage() {
  redirect("/profile");
}
