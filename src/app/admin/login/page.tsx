"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LogoLockup } from "@/components/Logo";
import { site } from "@/lib/site";
import { getBrowserSupabase } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Supabase is not configured yet. Add the keys to .env.local.");
      return;
    }

    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setBusy(false);

    if (signInError) {
      setError("That email and password combination didn't work. Please try again.");
      return;
    }
    router.replace(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@geneindiafoundation.org"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>
      <button className="btn btn-primary btn-lg login-submit" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div role="status" aria-live="polite">
        {error ? <div className="notice err">{error}</div> : null}
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Brand side - decorative on desktop, hidden on narrow screens where the
            form is all that matters. */}
        <aside className="login-aside" aria-hidden="true">
          <div className="login-aside-in">
            <span className="login-aside-name">{site.legalName}</span>
            <p className="login-aside-quote">{site.strapline}</p>
            <p className="login-aside-tag">{site.tagline}</p>
            <ul className="login-aside-list">
              <li>Publish stories and blog posts</li>
              <li>Manage the team directory</li>
              <li>Review messages and donations</li>
            </ul>
          </div>
        </aside>

        <div className="login-main">
          <Link className="login-back" href="/">
            <span aria-hidden="true">←</span> Back to website
          </Link>

          <div className="login-head">
            <span className="login-mobile-brand">
              <LogoLockup />
            </span>
            <span className="login-eyebrow">Team portal</span>
            <h1>Sign in</h1>
            <p className="hint">
              Only authorised foundation members can publish content. Ask an administrator if you
              need access.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="login-foot">
            Trouble signing in? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
