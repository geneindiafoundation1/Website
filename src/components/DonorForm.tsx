"use client";

import { useState } from "react";

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

export function DonorForm() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setState({ kind: "sending" });

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setState({ kind: "ok", message: body.message });
      form.reset();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="d-name">Full name</label>
        <input id="d-name" name="name" required autoComplete="name" maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="d-email">Email address</label>
        <input id="d-email" name="email" type="email" required autoComplete="email" maxLength={160} />
      </div>

      <div className="two">
        <div className="field">
          <label htmlFor="d-amt">Amount (₹)</label>
          <input id="d-amt" name="amount" type="number" min={1} inputMode="numeric" required />
        </div>
        <div className="field">
          <label htmlFor="d-mode">Paid via</label>
          <select id="d-mode" name="mode" defaultValue="UPI">
            <option>UPI</option>
            <option>Bank transfer</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="d-ref">Transaction / UTR reference</label>
        <input id="d-ref" name="reference" className="mono" placeholder="e.g. 4351XXXXXX12" maxLength={80} />
      </div>

      <div className="field">
        <label htmlFor="d-note">Message (optional)</label>
        <textarea id="d-note" name="note" style={{ minHeight: 80 }} maxLength={2000} />
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      <button className="btn btn-primary btn-lg self-start" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Confirm my donation"}
      </button>

      <div role="status" aria-live="polite">
        {state.kind === "ok" ? <div className="notice ok">{state.message}</div> : null}
        {state.kind === "error" ? <div className="notice err">{state.message}</div> : null}
      </div>
    </form>
  );
}
