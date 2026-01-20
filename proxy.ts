import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseJwt } from "./lib/helper";

const adminRoutes = [
  "/analitics-admin",
  "/authors-admin",
  "/banners-admin",
  "/books-admin",
  "/categories-admin",
  "/users-admin",
  "/plans-admin",
  "/promotions-admin",
];

const userRoutes = [
  "/profile",
  "/favourite-book",
  "/bookmark",
  "/purchased",
  "/subscription-settings",
  "/privacy",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute || isUserRoute) {
    if (pathname === "/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isAdminRoute) {
      const decodedToken = parseJwt(token);
      const userRoles = decodedToken?.roles || [];
      if (!userRoles.includes("admin")) {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
