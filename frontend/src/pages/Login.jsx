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
    <div className="max-w-md mx-auto px-4 py-16" data-testid="login-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Sign in</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Welcome back to Global Pet Registry.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><label className="gpr-label">Email</label>
          <input data-testid="login-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="gpr-input"/></div>
        <div><label className="gpr-label">Password</label>
          <input data-testid="login-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="gpr-input"/></div>
        {err && <div data-testid="login-error" className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="login-submit" disabled={loading} className="gpr-btn-primary w-full">{loading? "Signing in…" : "Sign in"}</button>
        <div className="text-sm text-[var(--gpr-muted)] text-center">No account? <Link to="/register" className="text-[var(--gpr-primary)] font-semibold">Register</Link></div>
      </form>
    </div>
  );
}
