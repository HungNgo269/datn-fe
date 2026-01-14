import { Suspense } from "react";
import BannersAdminClient from "./BannersAdminClient";

export default function BannersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BannersAdminClient />
    </Suspense>
  );
}
