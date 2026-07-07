import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu" },
      { status: 401 }
    );
  }

  const isValid = await verifyCredentials(username, password);
  if (!isValid) {
    return NextResponse.json(
      { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu" },
      { status: 401 }
    );
  }

  const token = await signSession(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
