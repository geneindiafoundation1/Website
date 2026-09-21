"use client";

import { useState } from "react";

const TOPICS = [
  "I'm a student seeking mentorship",
  "I'd like to volunteer as a mentor",
  "Partnership or collaboration",
  "Donation or 80G receipt query",
  "Something else",
];

type State = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

export function ContactForm() {
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
      const res = await fetch("/api/contact", {
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
      <div className="two">
        <div className="field">
          <label htmlFor="c-name">Full name</label>
          <input id="c-name" name="name" required autoComplete="name" maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="c-email">Email address</label>
          <input id="c-email" name="email" type="email" required autoComplete="email" maxLength={160} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="c-topic">What is this about?</label>
        <select id="c-topic" name="topic" defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="c-msg">Message</label>
        <textarea id="c-msg" name="message" required maxLength={4000} />
      </div>

      {/* Honeypot - real people never see or fill this. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      <button className="btn btn-primary btn-lg self-start" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="hint">We reply to most messages within two working days.</p>

      <div role="status" aria-live="polite">
        {state.kind === "ok" ? <div className="notice ok">{state.message}</div> : null}
        {state.kind === "error" ? <div className="notice err">{state.message}</div> : null}
      </div>
    </form>
  );
}
