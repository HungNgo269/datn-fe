import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseJwt } from "./lib/helper";

const adminRoutes = [
  "/analytics-admin",
  "/authors-admin",
  "/banners-admin",
  "/books-admin",
  "/categories-admin",
  "/users-admin",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    console.log("ré", request);
    const token = request.cookies.get("accessToken")?.value;
    console.log("checktoken", token);
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const decodedToken = parseJwt(token);
    const userRoles = decodedToken?.roles || [];
    console.log("decodedToken", userRoles);
    if (!userRoles.includes("admin")) {
      return NextResponse.next();
      //   return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
