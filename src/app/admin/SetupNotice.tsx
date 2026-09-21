import Link from "next/link";

/** Shown while Supabase keys are missing, so the panel explains itself. */
export function SetupNotice() {
  return (
    <div className="admin-main" style={{ maxWidth: 640, marginInline: "auto", paddingBlock: "4rem" }}>
      <p className="eyebrow">Admin panel</p>
      <h1 style={{ fontSize: "var(--step-2)", marginBlock: ".6rem 1rem" }}>
        Not connected yet
      </h1>
      <div className="prose">
        <p>
          The website is running on its built-in seed content. To switch on the admin panel - logins,
          blog editing, team editing, and image uploads - add your Supabase keys to{" "}
          <code className="mono">.env.local</code> and restart the dev server.
        </p>
        <p>
          The steps are in <code className="mono">README.md</code>, and the database schema is in{" "}
          <code className="mono">supabase/schema.sql</code>.
        </p>
      </div>
      <div className="cta-row">
        <Link className="btn btn-primary" href="/">
          Back to website
        </Link>
      </div>
    </div>
  );
}
