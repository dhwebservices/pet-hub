import React, { useState } from "react";
import { api } from "../lib/api";
import { useAuth, fmtErr } from "../lib/auth";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const PREMIUM_FEATURES = [
  "Multiple emergency contacts per pet",
  "Medical record vault with document storage",
  "Family / multi-user account access",
  "Priority alerts within 25 mi radius",
  "Extended document storage (up to 50 MB)",
];

export default function Subscribe() {
  const { user, setUser } = useAuth();
  const [msg, setMsg] = useState(""); const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center" data-testid="subscribe-auth-required">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Sign in to manage Premium</h1>
      <Link to="/login" className="gpr-btn-primary mt-6 inline-block">Sign in</Link>
    </div>
  );

  const subscribe = async () => {
    setMsg(""); setLoading(true);
    try {
      const { data } = await api.post("/subscriptions/checkout");
      if (data.url) { window.location.href = data.url; return; }
      if (data.mocked) {
        const me = await api.get("/auth/me"); setUser(me.data);
        setMsg("Premium activated in MOCKED mode (Stripe not configured).");
      }
    } catch(e){ setMsg(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };
  const cancel = async () => {
    await api.post("/subscriptions/cancel");
    const me = await api.get("/auth/me"); setUser(me.data); setMsg("Subscription cancelled.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" data-testid="subscribe-page">
      <div className="gpr-eyebrow">Premium plan</div>
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-2">£2.99 / month</h1>
      <p className="text-[var(--gpr-muted)] mt-2 max-w-2xl">Supports the alert network and unlocks family access, medical vault and extended storage. Cancel any time.</p>
      <div className="mt-12 border-t border-[var(--gpr-border)] pt-10 grid md:grid-cols-12 gap-10">
        <ul className="md:col-span-7 space-y-4">
          {PREMIUM_FEATURES.map((feat, i) => (
            <li key={i} className="flex items-start gap-3 text-lg"><CheckCircle2 className="w-5 h-5 text-[var(--gpr-success)] mt-1.5 flex-shrink-0"/><span>{feat}</span></li>
          ))}
        </ul>
        <div className="md:col-span-5 md:border-l md:border-[var(--gpr-border)] md:pl-10">
          {user.subscription_tier === "premium" ? (
            <>
              <div className="gpr-eyebrow mb-2">Current plan</div>
              <div className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Premium · active</div>
              <button data-testid="cancel-sub" onClick={cancel} className="gpr-btn-secondary mt-6">Cancel subscription</button>
            </>
          ) : (
            <>
              <div className="gpr-eyebrow mb-2">Get started</div>
              <div className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">£2.99<span className="text-[var(--gpr-muted)] text-base font-semibold"> / month</span></div>
              <button data-testid="subscribe-btn" disabled={loading} onClick={subscribe} className="gpr-btn-primary mt-6 w-full md:w-auto">{loading?"Redirecting…":"Subscribe"}</button>
            </>
          )}
          {msg && <div className="mt-4 text-sm text-[var(--gpr-muted)]">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
