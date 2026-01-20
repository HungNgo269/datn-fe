"use client";
import { useAuthStore } from "@/app/store/useAuthStore";
import { HeaderButton } from "./headerButton";
import { RegisterButton } from "./headerRegisterButton";
import { LoginButton } from "./headerLoginButton";

export default function AuthStatus() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

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
