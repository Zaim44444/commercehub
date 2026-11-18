import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getApiUrl,
  requireAdmin,
  SESSION_COOKIE,
} from "@/lib/auth";

import { UserStatusButton } from "./user-status-button";

type User = {
  id: string;
  fullName: string;
  email: string | null;
  roles: string[];
  isActive: boolean;
  createdAtUtc: string;
};

type UsersResponse = {
  items: User[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type PageProps = {
  searchParams: Promise<{
    search?: string | string[];
    page?: string | string[];
  }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();

  const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim().slice(0, 100)
      : "";

  const requestedPage =
    typeof params.page === "string" ? Number(params.page) : 1;

  const page =
    Number.isInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= 1_000_000
      ? requestedPage
      : 1;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/login");
  }

  function pageUrl(targetPage: number) {
    const query = new URLSearchParams({
      page: String(targetPage),
    });

    if (search) {
      query.set("search", search);
    }

    return `/dashboard/users?${query.toString()}`;
  }

  const query = new URLSearchParams({
    page: String(page),
    pageSize: "20",
  });

  if (search) {
    query.set("search", search);
  }

  const response = await fetch(
    `${getApiUrl()}/api/admin/users?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  ).catch(() => null);

  if (response?.status === 401) {
    redirect("/login");
  }

  if (response?.status === 403) {
    return (
      <p role="alert" className="text-destructive">
        You do not have permission to view users. Try signing in again.
      </p>
    );
  }

  if (!response?.ok) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Unable to load users</h1>

        <p role="alert" className="mt-2 text-sm text-muted-foreground">
          Check that the backend is running, then try again.
        </p>

        <Link
          href={pageUrl(page)}
          className="mt-4 inline-block text-sm font-medium underline"
        >
          Try again
        </Link>
      </div>
    );
  }

  const data: UsersResponse = await response.json();

  // Handle links to pages that no longer exist.
  const lastPage = Math.max(1, data.totalPages);

  if (page > lastPage) {
    redirect(pageUrl(lastPage));
  }

  const firstItem =
    data.items.length > 0 ? (data.page - 1) * data.pageSize + 1 : 0;

  const lastItem =
    data.items.length > 0 ? firstItem + data.items.length - 1 : 0;

  const navigationClass =
    "inline-flex items-center justify-center rounded-lg border " +
    "bg-background px-4 py-2 text-sm font-medium hover:bg-muted";

  const dateFormatter = new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>

          <p className="mt-2 text-muted-foreground">
            Manage customer, vendor, and administrator accounts.
          </p>
        </div>

        <Badge variant="secondary">
          {data.totalCount} users
        </Badge>
      </div>

      <section className="overflow-hidden rounded-xl border bg-card shadow-md">
        <form
          action="/dashboard/users"
          method="get"
          className="flex flex-wrap items-center gap-3 border-b p-4"
        >
          <label htmlFor="user-search" className="sr-only">
            Search users by name or email
          </label>

          <Input
            key={search}
            id="user-search"
            name="search"
            defaultValue={search}
            maxLength={100}
            placeholder="Search name or email..."
            className="w-full sm:max-w-sm"
          />

          <Button type="submit">Search</Button>

          {search && (
            <Link
              href="/dashboard/users"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </Link>
          )}
        </form>

        <Table>
          <TableCaption className="sr-only">
            Registered CommerceHub accounts
          </TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Joined</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {search
                    ? "No users match your search."
                    : "No registered users yet."}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-4 font-medium">
                    {user.fullName}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {user.email || "—"}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0
                        ? user.roles.map((role) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))
                        : "—"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="pr-4 text-muted-foreground">
                    {dateFormatter.format(new Date(user.createdAtUtc))}
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    <UserStatusButton
                        userId={user.id}
                        fullName={user.fullName}
                        isActive={user.isActive}
                        isCurrentUser={user.id === admin.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {firstItem}–{lastItem} of {data.totalCount} users
        </p>

        <nav
          aria-label="User pagination"
          className="flex items-center gap-3"
        >
          {data.page > 1 ? (
            <Link
              href={pageUrl(data.page - 1)}
              className={navigationClass}
            >
              Previous
            </Link>
          ) : (
            <Button variant="outline" disabled>
              Previous
            </Button>
          )}

          <span className="text-sm text-muted-foreground">
            Page {data.page} of {lastPage}
          </span>

          {data.page < data.totalPages ? (
            <Link
              href={pageUrl(data.page + 1)}
              className={navigationClass}
            >
              Next
            </Link>
          ) : (
            <Button variant="outline" disabled>
              Next
            </Button>
          )}
        </nav>
      </div>
    </div>
  );
}