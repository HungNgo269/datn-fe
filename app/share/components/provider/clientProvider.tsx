"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@/app/share/components/provider/themeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import dynamic from "next/dynamic";
import PaymentSuccessToast from "@/app/share/components/provider/paymentSuccessToast";

const BookAudioStickyPlayer = dynamic(
  () =>
    import("@/app/feature/book-audio/components/BookAudioStickyPlayer").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <PaymentSuccessToast />
        {children}
        <Suspense fallback={null}>
          <BookAudioStickyPlayer />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
