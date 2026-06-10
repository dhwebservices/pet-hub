import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, fmtErr } from "../lib/auth";

const FEATURES = [
  "Multiple emergency contacts per pet",
  "Medical record vault with documents",
  "Family · multi-user account access",
  "Priority alerts within 25 mi radius",
  "Extended document storage",
];

export default function Subscribe() {
  const { user, setUser } = useAuth();
  const [msg, setMsg] = useState(""); const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center" data-testid="subscribe-auth-required">
      <h1 className="font-extrabold text-4xl md:text-5xl text-[var(--npw-text)]">Sign in to <span className="text-[var(--npw-accent)]">manage Premium</span>.</h1>
      <Link to="/login" className="npw-link mt-8 inline-flex">Sign in →</Link>
    </div>
  );

  const subscribe = async () => {
    setMsg(""); setLoading(true);
    try {
      const { data } = await api.post("/subscriptions/checkout");
      if (data.url) { window.location.href = data.url; return; }
      if (data.mocked) { const me = await api.get("/auth/me"); setUser(me.data); setMsg("Premium activated in MOCKED mode (Stripe not configured)."); }
    } catch(e){ setMsg(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };
  const cancel = async () => {
    await api.post("/subscriptions/cancel"); const me = await api.get("/auth/me"); setUser(me.data); setMsg("Subscription cancelled.");
  };

  return (
    <div data-testid="subscribe-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-12">
        <header className="md:col-span-7">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Membership · Premium</div>
          <div className="flex items-start gap-6 leading-none mt-2">
            <span className=" text-[var(--npw-text)] font-medium text-[28px] md:text-4xl mt-4">£</span>
            <span className="font-extrabold text-[var(--npw-text)] text-[140px] md:text-[220px] leading-[0.82] tracking-tight">2.99</span>
            <span className="text-[var(--npw-muted)] mt-6 text-xl md:text-2xl">/ a month</span>
          </div>
          <p className="text-[var(--npw-muted)] text-lg mt-8 max-w-xl leading-[1.6]">Your subscription keeps the alert network free for owners who can't afford to pay. Cancel any time, no questions asked.</p>
          <div className="mt-12">
            {user.subscription_tier === "premium" ? (
              <div className="space-y-4">
                <div className="font-extrabold text-3xl text-[var(--npw-action)]">Active</div>
                <button data-testid="cancel-sub" onClick={cancel} className="npw-link">Cancel subscription →</button>
              </div>
            ) : (
              <button data-testid="subscribe-btn" disabled={loading} onClick={subscribe} className="npw-btn-primary">{loading ? "Redirecting…" : "Subscribe →"}</button>
            )}
            {msg && <div className="italic text-[15px] text-[var(--npw-muted)] mt-6">{msg}</div>}
          </div>
        </header>
        <ul className="md:col-span-4 md:col-start-9 md:pt-6 ">
          <li className="npw-eyebrow text-[var(--npw-muted)] pb-4 border-b border-[var(--npw-border)]">What's included</li>
          {FEATURES.map((f,i) => (
            <li key={i} className="flex gap-5 py-5 border-b border-[var(--npw-border)]">
              <span className="font-mono text-xs text-[var(--npw-muted)] tracking-wider pt-1">{String(i+1).padStart(2,'0')}</span>
              <span className="italic text-[17px] leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
