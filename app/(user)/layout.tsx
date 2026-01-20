"use client";

import { ReactNode, useState } from "react";
import Header from "../share/components/ui/header/header";
import FooterComponent from "../share/components/ui/footer/footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSidebar } from "../feature/account/components/account-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <Header />
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 ">
          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
              <div className="sticky top-24">
                <AccountSidebar />
              </div>
            </aside>

            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button 
                    size="icon" 
                    className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <AccountSidebar />
                </SheetContent>
              </Sheet>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 lg:p-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterComponent />
    </div>
  );
}
