import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap center" style={{ minHeight: "70vh", justifyContent: "center" }}>
      <p className="eyebrow">404</p>
      <h1 style={{ fontSize: "var(--step-3)" }}>We couldn&rsquo;t find that page</h1>
      <p className="lede">The link may be out of date, or the page may have moved.</p>
      <Link className="btn btn-primary btn-lg" href="/">
        Back to home
      </Link>
    </section>
  );
}
