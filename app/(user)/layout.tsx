"use client";

import { ReactNode, useState } from "react";
import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSidebar } from "../feature/account/components/account-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
      </header>

      <div className="flex flex-1 container mx-auto px-0 md:px-4 lg:px-8 py-6 gap-6 mt-12">
        <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-8rem)] sticky top-24">
          <div className="h-full rounded-xl  overflow-hidden ">
            <AccountSidebar />
          </div>
        </aside>

        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full h-12 w-12 ">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <AccountSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 min-w-0">
          <div className="bg-background rounded-xl min-h-[500px]">
            {children}
          </div>
        </main>
      </div>

      <div className="border-t mt-auto">
        <FooterComponent />
      </div>
    </div>
  );
}
