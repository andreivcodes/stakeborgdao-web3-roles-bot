import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

let Environment = "production" | "development" | "other";
export function middleware(req, ev) {
  const currentEnv = process.env.NODE_ENV;

  if (
    currentEnv === "production" &&
    req.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://roles.stakeborgdao.xyz/${req.nextUrl.pathname}`,
      301
    );
  }
  return NextResponse.next();
}
