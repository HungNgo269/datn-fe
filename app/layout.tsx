import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import Script from "next/script";
import { inter } from "@/app/share/components/ui/fonts";
import ClientProvider from "@/app/share/components/provider/clientProvider";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Next Book",
  },
  description: "Every book that you need, light weight and no ad website",
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_API_URL}`),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PXGEXKTLQL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PXGEXKTLQL');
          `}
        </Script>
      </head>
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
