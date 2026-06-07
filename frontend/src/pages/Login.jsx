import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, fmtErr } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const u = await login(email, password);
      nav(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) { setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  return (
    <div data-testid="login-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <div className="md:col-span-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">Member Sign-In</div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[1]">Welcome <em className="accent text-[var(--gpr-alert)]">back</em>.</h1>
        <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-6 max-w-md leading-[1.6]">Your dashboard, pet records, alerts and subscription all live behind this door.</p>
        <p className="text-[13px] text-[var(--gpr-muted)] mt-10">No account yet? <Link to="/register" className="text-[var(--gpr-primary)] font-semibold border-b border-[var(--gpr-primary)]/40">Register here</Link>.</p>
      </div>
      <form onSubmit={submit} className="md:col-span-5 md:col-start-8 space-y-8">
        <div>
          <label className="gpr-label">Email</label>
          <input data-testid="login-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="gpr-input"/>
        </div>
        <div>
          <label className="gpr-label">Password</label>
          <input data-testid="login-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="gpr-input"/>
        </div>
        {err && <div data-testid="login-error" className="text-sm text-[var(--gpr-alert)] font-serif italic">{err}</div>}
        <button data-testid="login-submit" disabled={loading} className="gpr-btn-primary">{loading? "Signing in…" : "Sign in →"}</button>
      </form>
    </div>
  );
}
