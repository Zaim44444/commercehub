"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  getApiUrl,
  requireAdmin,
  SESSION_COOKIE,
} from "@/lib/auth";

type StatusResult =
  | { ok: true }
  | { ok: false; message: string };

export async function updateUserStatus(
  userId: string,
  isActive: boolean,
): Promise<StatusResult> {
  const admin = await requireAdmin();

  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    userId.length > 128 ||
    typeof isActive !== "boolean"
  ) {
    return { ok: false, message: "Invalid account status request." };
  }

  if (userId === admin.id && !isActive) {
    return {
      ok: false,
      message: "You cannot deactivate your own account.",
    };
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return { ok: false, message: "Please sign in again." };
  }

  const response = await fetch(
    `${getApiUrl()}/api/admin/users/${encodeURIComponent(userId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  ).catch(() => null);

  if (!response) {
    return {
      ok: false,
      message: "Unable to confirm the update. Refresh to check the status.",
    };
  }

  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "This account status change is not allowed.",
      401: "Your session has expired. Please sign in again.",
      403: "You do not have permission to change account status.",
      404: "This account no longer exists. Refresh the page.",
      409: "This account changed. Refresh and try again.",
    };

    return {
      ok: false,
      message:
        messages[response.status] ??
        "Unable to update the account. Please try again.",
    };
  }

  revalidatePath("/dashboard/users");

  return { ok: true };
}