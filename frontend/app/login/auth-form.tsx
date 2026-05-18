"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/app/login/actions";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath: string;
};

const initialState: AuthFormState = {
  fields: {
    email: "",
  },
  message: null,
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="quiet-panel subtle-card w-full rounded-lg p-5 sm:p-6">
      <input type="hidden" name="next" value={nextPath} />
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">
          {isRegister ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">
          {isRegister ? "Start a calm workspace." : "Sign in to Bob."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {isRegister
            ? "Create the first local user, then Bob will keep the operating workspace protected."
            : "Use your local account to open leads, pipeline, and workspace context."}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {isRegister ? (
          <label className="block">
            <span className="text-xs font-medium text-faint">Name</span>
            <input
              name="name"
              defaultValue={state.fields.name}
              className="mt-2 h-11 w-full rounded-md border border-border/70 bg-black/20 px-3 text-sm text-ink outline-none transition focus:border-accent/45"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-xs font-medium text-faint">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={state.fields.email}
            className="mt-2 h-11 w-full rounded-md border border-border/70 bg-black/20 px-3 text-sm text-ink outline-none transition focus:border-accent/45"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-faint">Password</span>
          <input
            name="password"
            type="password"
            className="mt-2 h-11 w-full rounded-md border border-border/70 bg-black/20 px-3 text-sm text-ink outline-none transition focus:border-accent/45"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>
      </div>

      {state.message ? (
        <p className="mt-4 rounded-md border border-border/70 bg-black/20 px-3 py-2 text-sm text-muted">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="focus-ring warm-button mt-6 flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Working..." : isRegister ? "Create user" : "Sign in"}
      </button>

      <p className="mt-4 text-center text-sm text-faint">
        {isRegister ? "Already have a user?" : "Need the first local user?"}{" "}
        <Link
          href={`${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(nextPath)}`}
          className="font-medium text-[rgb(var(--champagne))] transition hover:text-ink"
        >
          {isRegister ? "Sign in" : "Register"}
        </Link>
      </p>
    </form>
  );
}
