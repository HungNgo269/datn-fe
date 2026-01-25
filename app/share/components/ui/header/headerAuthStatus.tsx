"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { HeaderButton } from "./headerButton";
import { RegisterButton } from "./headerRegisterButton";
import { LoginButton } from "./headerLoginButton";

export default function AuthStatus() {
  const userStore = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = isMounted ? userStore : null;

  if (isLoading) {
    return <div>...</div>;
  }

  if (user) {
    return (
      <div className="flex flex-row gap-3 items-center">
        <div className="hidden sm:flex flex-row justify-center">
          {/* <NotificationReceiver userId={user.id}></NotificationReceiver> */}
        </div>
        <HeaderButton />
      </div>
    );
  } else {
    return (
      <div className="flex flex-row gap-4">
        <RegisterButton></RegisterButton>
        <LoginButton></LoginButton>
      </div>
    );
  }
}
