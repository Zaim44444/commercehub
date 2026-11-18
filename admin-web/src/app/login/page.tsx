"use client";

import { useActionState } from "react";

import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {
    message: "",
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">
          CommerceHub Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Sign in with your administrator account.
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <p aria-live="polite" className="text-sm text-red-600">
            {state.message}
          </p>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}