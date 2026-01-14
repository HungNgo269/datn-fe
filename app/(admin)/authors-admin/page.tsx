import { Suspense } from "react";
import AuthorsAdminClient from "./AuthorsAdminClient";

export default function AuthorsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AuthorsAdminClient />
    </Suspense>
  );
}
