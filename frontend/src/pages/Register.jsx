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
    <div data-testid="register-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-12">
        <header className="md:col-span-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">Owner Enrolment</div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[1]">Join the <em className="accent text-[var(--gpr-alert)]">network</em>.</h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-6 leading-[1.6] max-w-md">Your postcode powers the radius alert engine. We never display your home address publicly.</p>
          <p className="text-[13px] text-[var(--gpr-muted)] mt-10">Already a member? <Link to="/login" className="text-[var(--gpr-primary)] font-semibold border-b border-[var(--gpr-primary)]/40">Sign in</Link>.</p>
        </header>
        <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-12">
          <fieldset className="space-y-8">
            <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-2">i &middot; About you</legend>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              <div><label className="gpr-label">First name</label><input data-testid="reg-first" required className="gpr-input" value={f.first_name} onChange={e=>set('first_name', e.target.value)}/></div>
              <div><label className="gpr-label">Last name</label><input data-testid="reg-last" required className="gpr-input" value={f.last_name} onChange={e=>set('last_name', e.target.value)}/></div>
              <div><label className="gpr-label">Email</label><input data-testid="reg-email" type="email" required className="gpr-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
              <div><label className="gpr-label">Password</label><input data-testid="reg-password" type="password" required minLength={8} className="gpr-input" value={f.password} onChange={e=>set('password', e.target.value)}/></div>
              <div className="sm:col-span-2"><label className="gpr-label">Phone</label><input data-testid="reg-phone" className="gpr-input" value={f.phone} onChange={e=>set('phone', e.target.value)}/></div>
            </div>
          </fieldset>

          <fieldset className="space-y-8">
            <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-2">ii &middot; Where the alerts go</legend>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              <div className="sm:col-span-2"><label className="gpr-label">Address</label><input data-testid="reg-address" className="gpr-input" value={f.address} onChange={e=>set('address', e.target.value)}/></div>
              <div><label className="gpr-label">Town</label><input data-testid="reg-town" className="gpr-input" value={f.town} onChange={e=>set('town', e.target.value)}/></div>
              <div><label className="gpr-label">County</label><input data-testid="reg-county" className="gpr-input" value={f.county} onChange={e=>set('county', e.target.value)}/></div>
              <div><label className="gpr-label">Postcode</label><input data-testid="reg-postcode" required className="gpr-input" value={f.postcode} onChange={e=>set('postcode', e.target.value)}/></div>
              <div><label className="gpr-label">Country</label>
                <select className="gpr-input" value={f.country} onChange={e=>set('country', e.target.value)}>
                  <option value="UK">United Kingdom</option><option value="IE">Ireland</option><option value="US">United States</option><option value="CA">Canada</option><option value="AU">Australia</option>
                </select></div>
            </div>
          </fieldset>

          {err && <div data-testid="reg-error" className="text-sm text-[var(--gpr-alert)] font-serif italic">{err}</div>}
          <div className="pt-6 border-t border-[var(--gpr-border)] flex flex-wrap items-center justify-between gap-4">
            <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] max-w-sm">By creating an account you agree to the <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy" className="underline">privacy notice</Link>.</p>
            <button data-testid="reg-submit" disabled={loading} className="gpr-btn-primary">{loading? "Creating account…" : "Create account →"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
