"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogin = () => {
    const callbackUrl = encodeURIComponent(pathname);
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
