import { Suspense } from "react";
import CategoriesAdminClient from "./CategoriesAdminClient";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CategoriesAdminClient />
    </Suspense>
  );
}
