import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, fmtErr } from "../lib/auth";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ first_name:"", last_name:"", email:"", password:"", phone:"", address:"", town:"", county:"", postcode:"", country:"UK" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await register(f); nav("/dashboard"); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16" data-testid="register-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Create your account</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Your address powers the location-based alert network — we never display it publicly.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="gpr-label">First name</label><input data-testid="reg-first" required className="gpr-input" value={f.first_name} onChange={e=>set('first_name', e.target.value)}/></div>
          <div><label className="gpr-label">Last name</label><input data-testid="reg-last" required className="gpr-input" value={f.last_name} onChange={e=>set('last_name', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Email</label><input data-testid="reg-email" type="email" required className="gpr-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
        <div><label className="gpr-label">Password</label><input data-testid="reg-password" type="password" required minLength={8} className="gpr-input" value={f.password} onChange={e=>set('password', e.target.value)}/></div>
        <div><label className="gpr-label">Phone</label><input data-testid="reg-phone" className="gpr-input" value={f.phone} onChange={e=>set('phone', e.target.value)}/></div>
        <div><label className="gpr-label">Address</label><input data-testid="reg-address" className="gpr-input" value={f.address} onChange={e=>set('address', e.target.value)}/></div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="gpr-label">Town</label><input data-testid="reg-town" className="gpr-input" value={f.town} onChange={e=>set('town', e.target.value)}/></div>
          <div><label className="gpr-label">County</label><input data-testid="reg-county" className="gpr-input" value={f.county} onChange={e=>set('county', e.target.value)}/></div>
          <div><label className="gpr-label">Postcode</label><input data-testid="reg-postcode" required className="gpr-input" value={f.postcode} onChange={e=>set('postcode', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Country</label>
          <select className="gpr-input" value={f.country} onChange={e=>set('country', e.target.value)}>
            <option value="UK">United Kingdom</option><option value="IE">Ireland</option><option value="US">United States</option><option value="CA">Canada</option><option value="AU">Australia</option>
          </select></div>
        {err && <div data-testid="reg-error" className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="reg-submit" disabled={loading} className="gpr-btn-primary w-full">{loading? "Creating account…" : "Create account"}</button>
        <div className="text-sm text-[var(--gpr-muted)] text-center">Have an account? <Link to="/login" className="text-[var(--gpr-primary)] font-semibold">Sign in</Link></div>
      </form>
    </div>
  );
}
