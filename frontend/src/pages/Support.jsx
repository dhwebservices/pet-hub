import React, { useState } from "react";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";

export default function Support() {
  const [f, setF] = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const set = (k,v) => setF(s => ({...s, [k]: v}));
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { await api.post("/support", f); setSent(true); } catch(e){ setErr(fmtErr(e.response?.data?.detail)); }
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-12" data-testid="support-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Support</h1>
      <p className="text-[var(--gpr-muted)] mt-2">We aim to reply within 24 hours. For urgent recovery situations, file a lost report immediately so the alert network can dispatch.</p>
      {sent ? (
        <div className="mt-10 border-t border-[var(--gpr-border)] pt-8 text-center">
          <div className="font-display font-bold text-xl text-[var(--gpr-primary)]">Thanks — we'll be in touch.</div>
          <p className="text-[var(--gpr-muted)] mt-2 text-sm">Your ticket has been logged.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="gpr-label">Name</label><input required className="gpr-input" value={f.name} onChange={e=>set('name', e.target.value)}/></div>
            <div><label className="gpr-label">Email</label><input required type="email" className="gpr-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
          </div>
          <div><label className="gpr-label">Subject</label><input required className="gpr-input" value={f.subject} onChange={e=>set('subject', e.target.value)}/></div>
          <div><label className="gpr-label">Message</label><textarea required className="gpr-input" rows={5} value={f.message} onChange={e=>set('message', e.target.value)}/></div>
          {err && <div className="text-sm text-[var(--gpr-alert)]">{err}</div>}
          <button data-testid="support-submit" className="gpr-btn-primary">Send message</button>
        </form>
      )}
    </div>
  );
}
