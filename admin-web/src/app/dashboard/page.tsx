import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Admin workspace</Badge>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Welcome back, {user.fullName}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your CommerceHub platform from here.
        </p>
      </div>

      <Link
        href="/dashboard/users"
        className="block max-w-md rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
      >
        <h2 className="text-lg font-semibold">User management</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          View registered accounts, roles, and account status.
        </p>

        <p className="mt-5 text-sm font-medium">
          Open users →
        </p>
      </Link>
    </div>
  );
}