import { NextResponse } from "next/server";

export function middleware(req, ev) {
  const currentEnv = process.env.NODE_ENV;

  if (
    currentEnv === "production" &&
    req.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(`https://roles.stakeborgdao.xyz/`, 301);
  }
  return NextResponse.next();
}
