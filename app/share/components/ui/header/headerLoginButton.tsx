"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function LoginButtonContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleLogin = () => {
    const search = searchParams?.toString();
    const nextPath =
      pathname && pathname.length > 0
        ? search && search.length > 0
          ? `${pathname}?${search}`
          : pathname
        : "/";
    const callbackUrl = encodeURIComponent(nextPath);
    router.push(`/login?callbackUrl=${callbackUrl}`);
  };

  return (
    <Button
      className={`$ hidden md:block`}
      variant={"outline"}
      onClick={handleLogin}
    >
      Đăng nhập
    </Button>
  );
}

export function LoginButton() {
  return (
    <Suspense fallback={null}>
      <LoginButtonContent />
    </Suspense>
  );
}
