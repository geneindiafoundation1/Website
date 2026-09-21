import Link from "next/link";

/** Shown to read-only members instead of an editing screen or a raw error. */
export function NoPermission({
  what = "change this",
  back = "/admin",
  backLabel = "Back to overview",
}: {
  what?: string;
  back?: string;
  backLabel?: string;
}) {
  return (
    <>
      <div className="admin-head">
        <h1>Not permitted</h1>
      </div>
      <div className="panel" style={{ maxWidth: 560 }}>
        <p className="eyebrow">Read-only access</p>
        <h2 style={{ fontSize: "var(--step-1)", marginBlock: ".5rem .7rem" }}>
          You don&rsquo;t have permission to {what}.
        </h2>
        <p style={{ color: "var(--ink-soft)" }}>
          Your account can view content and read messages, but not publish or edit. If you need
          editing access, ask a foundation administrator to change your role.
        </p>
        <div className="cta-row" style={{ marginTop: "1.2rem" }}>
          <Link className="btn btn-primary btn-sm" href={back}>
            {backLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
