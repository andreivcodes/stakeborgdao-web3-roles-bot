import { NextResponse } from "next/server";

export function middleware(req, ev) {
  const currentEnv = process.env.NODE_ENV;
  const proto = req.headers["x-forwarded-proto"] ? "https" : "http";
  if (currentEnv === "production" && proto != "https") {
    return NextResponse.redirect(`https://roles.stakeborgdao.xyz/`, 301);
  }
  return NextResponse.next();
}
