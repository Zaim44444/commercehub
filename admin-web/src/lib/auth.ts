import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "commercehub.admin.session";

export function getApiUrl() {
  const url = process.env.COMMERCE_API_URL;

  if (!url) {
    throw new Error("COMMERCE_API_URL is missing.");
  }

  return url.replace(/\/+$/, "");
}

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
};

export async function requireAdmin(): Promise<AdminUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${getApiUrl()}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Unable to verify your account. Please try again.");
  }

  const user: AdminUser = await response.json();

  if (!Array.isArray(user.roles) || !user.roles.includes("Admin")) {
    redirect("/login?error=forbidden");
  }

  return user;
}