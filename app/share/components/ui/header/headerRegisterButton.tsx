"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export function RegisterButton() {
  const pathname = usePathname();
  const router = useRouter();

  const handleRegister = () => {
    const callbackUrl = encodeURIComponent(pathname);
    router.push(`/register?callbackUrl=${callbackUrl}`);
  };

  return (
    <Button className={`$ hidden md:block`} onClick={handleRegister}>
      Đăng ký
    </Button>
  );
}
