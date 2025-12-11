import { Suspense } from "react";
import Header from "../share/components/ui/header/header";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header></Header>
      <Suspense>
        <main className="flex  items-center justify-center my-auto">
          <div className="relative w-full">{children}</div>
        </main>
      </Suspense>
    </div>
  );
}
