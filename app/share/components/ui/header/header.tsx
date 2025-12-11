// import SearchComponent from "@/app/ui/user/search/searchComponent";
import Link from "next/link";
import Logo from "../logo";
import HeaderClientColor from "./headerClientColor";

import AuthStatus from "./headerAuthStatus";
// import NotificationReceiver from "@/app/ui/user/headerCustomer/NotificationReceiver";

export default async function Header() {
  return (
    <div className="w-full">
      <div className="max-w-screen mx-auto w-full">
        <div className="flex items-center justify-between h-16 md:px-4 lg:px-8 xl:px-12 mx-3">
          <div className="flex flex-row items-center">
            <Link
              prefetch={true}
              href={"/"}
              className="sm:text-xl md:text-2xl lg:text-3xl"
            >
              <Logo />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="sm:hidden">{/* <SearchComponent compact /> */}</div>
            <div className="hidden sm:block flex-grow-0 flex-shrink basis-[250px]">
              {/* <SearchComponent /> */}
            </div>
            <HeaderClientColor></HeaderClientColor>
            <AuthStatus></AuthStatus>
          </div>
        </div>
      </div>
    </div>
  );
}
