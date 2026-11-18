"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getApiUrl, SESSION_COOKIE } from "@/lib/auth";

export type LoginState = {
  message: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string" ||
    !emailValue.trim() ||
    !passwordValue
  ) {
    return { message: "Please enter your email and password." };
  }

  try {
    const response = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValue.trim(),
        password: passwordValue,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401) {
      return {
        message: "Unable to sign in with these credentials.",
      };
    }

    if (!response.ok) {
      return {
        message: "Sign-in is temporarily unavailable. Please try again.",
      };
    }

    const data = await response.json();

    if (
      typeof data.accessToken !== "string" ||
      !data.accessToken ||
      typeof data.expiresAtUtc !== "string" ||
      !Array.isArray(data.user?.roles)
    ) {
      return { message: "The server returned an invalid login response." };
    }

    if (!data.user.roles.includes("Admin")) {
      return { message: "An Admin account is required." };
    }

    const expires = new Date(data.expiresAtUtc);

    if (
      !Number.isFinite(expires.getTime()) ||
      expires.getTime() <= Date.now()
    ) {
      return { message: "The server returned an invalid session expiry." };
    }

    (await cookies()).set(SESSION_COOKIE, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    });
  } catch {
    return {
      message: "Unable to connect to the server. Please try again.",
    };
  }

  // Keep redirect outside try/catch: Next.js implements it by throwing.
  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}