import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicExact = new Set([
  "/",
  "/ogrenci/giris",
  "/ogrenci/kayit",
  "/danisman/giris",
  "/danisman/kayit",
  "/yonetici/giris",
  "/sifremi-unuttum",
  "/sifre-sifirla",
]);

function isPublic(pathname: string) {
  if (publicExact.has(pathname)) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/public")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (isPublic(pathname)) {
    if (token && (pathname.endsWith("/giris") || pathname.endsWith("/kayit") || pathname === "/")) {
      const dest = homeFor(token.role as string, token.approvalStatus as string | null);
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const role = token.role as string;
  const approval = (token.approvalStatus as string | null) ?? null;

  if (pathname.startsWith("/ogrenci")) {
    if (role !== "OGRENCI") return NextResponse.redirect(new URL(homeFor(role, approval), request.url));
  }

  if (pathname.startsWith("/danisman/onay-bekliyor")) {
    if (role !== "DANISMAN") return NextResponse.redirect(new URL(homeFor(role, approval), request.url));
    if (approval === "ONAYLANDI") {
      return NextResponse.redirect(new URL("/danisman/panel", request.url));
    }
  }

  if (pathname.startsWith("/danisman/panel")) {
    if (role !== "DANISMAN") return NextResponse.redirect(new URL(homeFor(role, approval), request.url));
    if (approval !== "ONAYLANDI") {
      return NextResponse.redirect(new URL("/danisman/onay-bekliyor", request.url));
    }
  }

  if (pathname.startsWith("/yonetici")) {
    if (role !== "YONETICI") return NextResponse.redirect(new URL(homeFor(role, approval), request.url));
  }

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    if (!token) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function homeFor(role: string, approval: string | null) {
  if (role === "OGRENCI") return "/ogrenci/panel";
  if (role === "DANISMAN") {
    return approval === "ONAYLANDI" ? "/danisman/panel" : "/danisman/onay-bekliyor";
  }
  if (role === "YONETICI") return "/yonetici/panel";
  return "/";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
