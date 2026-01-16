import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { inter } from "@/app/share/components/ui/fonts";
import ClientProvider from "@/app/share/components/provider/clientProvider";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Next Book",
  },
  description: "Every book that you need, light weight and no ad website",
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_API_URL}`),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} antialiased font-normal `}
      >
        {/* <CronInitializer />  */}
        <ClientProvider>{children}</ClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
