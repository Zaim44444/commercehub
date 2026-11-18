import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 text-foreground dark:bg-slate-900 md:flex">
    <aside className="border-b border-slate-800 bg-slate-950 p-5 text-slate-100 md:fixed md:inset-y-0 md:w-64 md:border-r md:border-b-0">
    <Link href="/dashboard" className="text-xl font-bold text-white">
        CommerceHub
    </Link>

    <p className="mt-1 text-sm text-slate-400">
        Administration
    </p>

    <nav aria-label="Admin navigation" className="mt-8 space-y-2">
        <Link
        href="/dashboard"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
        Dashboard
        </Link>

        <Link
        href="/dashboard/users"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
        Users
        </Link>
    </nav>
    </aside>

      <div className="min-w-0 flex-1 md:ml-64">
        <header className="flex items-center justify-between gap-4 border-b bg-card px-6 py-4">
          <div className="min-w-0">
          </div>

          <form action={logout}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </header>

        <main className="mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}