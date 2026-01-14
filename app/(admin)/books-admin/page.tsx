import { Suspense } from "react";
import BooksAdminClient from "./BooksAdminClient";

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BooksAdminClient />
    </Suspense>
  );
}
