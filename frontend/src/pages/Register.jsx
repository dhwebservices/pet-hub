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
  const passwordValid = f.password.length >= 10 && /[A-Z]/.test(f.password) && /[a-z]/.test(f.password) && /\d/.test(f.password) && /[^A-Za-z0-9]/.test(f.password);
  const postcodeValid = f.postcode.trim().length >= 3;

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    if (!passwordValid) {
      setErr("Password must be at least 10 characters and include upper and lower case letters, a number and a symbol.");
      setLoading(false);
      return;
    }
    if (!postcodeValid) {
      setErr("Enter a valid postcode so local lost-pet alerts can work.");
      setLoading(false);
      return;
    }
    try { await register(f); nav("/dashboard"); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  return (
    <div data-testid="register-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-12">
        <header className="md:col-span-5">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Owner Enrolment</div>
          <h1 className="font-extrabold text-5xl md:text-6xl text-[var(--npw-text)] leading-[1]">Join the <span className="text-[var(--npw-accent)]">network</span>.</h1>
          <p className="text-[var(--npw-muted)] text-lg mt-6 leading-[1.6] max-w-md">Your postcode powers the radius alert engine. We never display your home address publicly.</p>
          <p className="text-[13px] text-[var(--npw-muted)] mt-10">Already a member? <Link to="/login" className="text-[var(--npw-text)] font-semibold border-b border-[var(--npw-text)]/40">Sign in</Link>.</p>
        </header>
        <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-12">
          <fieldset className="space-y-8">
            <legend className="npw-eyebrow text-[var(--npw-muted)] mb-2">i &middot; About you</legend>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              <div><label className="npw-label">First name</label><input data-testid="reg-first" required className="npw-input" value={f.first_name} onChange={e=>set('first_name', e.target.value)}/></div>
              <div><label className="npw-label">Last name</label><input data-testid="reg-last" required className="npw-input" value={f.last_name} onChange={e=>set('last_name', e.target.value)}/></div>
              <div><label className="npw-label">Email</label><input data-testid="reg-email" type="email" required className="npw-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
              <div>
                <label className="npw-label">Password</label>
                <input data-testid="reg-password" type="password" required minLength={10} className="npw-input" value={f.password} onChange={e=>set('password', e.target.value)} aria-describedby="password-hint"/>
                <span id="password-hint" className="npw-hint mt-2">Use at least 10 characters, with upper and lower case letters, a number and a symbol.</span>
              </div>
              <div className="sm:col-span-2"><label className="npw-label">Phone</label><input data-testid="reg-phone" className="npw-input" value={f.phone} onChange={e=>set('phone', e.target.value)}/></div>
            </div>
          </fieldset>

          <fieldset className="space-y-8">
            <legend className="npw-eyebrow text-[var(--npw-muted)] mb-2">ii &middot; Where the alerts go</legend>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              <div className="sm:col-span-2"><label className="npw-label">Address</label><input data-testid="reg-address" className="npw-input" value={f.address} onChange={e=>set('address', e.target.value)}/></div>
              <div><label className="npw-label">Town</label><input data-testid="reg-town" className="npw-input" value={f.town} onChange={e=>set('town', e.target.value)}/></div>
              <div><label className="npw-label">County</label><input data-testid="reg-county" className="npw-input" value={f.county} onChange={e=>set('county', e.target.value)}/></div>
              <div><label className="npw-label">Postcode</label><input data-testid="reg-postcode" required minLength={3} className="npw-input" value={f.postcode} onChange={e=>set('postcode', e.target.value)}/></div>
              <div><label className="npw-label">Country</label>
                <select className="npw-input" value={f.country} onChange={e=>set('country', e.target.value)}>
                  <option value="UK">United Kingdom</option><option value="IE">Ireland</option><option value="US">United States</option><option value="CA">Canada</option><option value="AU">Australia</option>
                </select></div>
            </div>
          </fieldset>

          {err && <div data-testid="reg-error" className="text-sm text-[var(--npw-warn)] italic">{err}</div>}
          <div className="pt-6 border-t border-[var(--npw-border)] flex flex-wrap items-center justify-between gap-4">
            <p className="italic text-[13px] text-[var(--npw-muted)] max-w-sm">By creating an account you agree to the <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy" className="underline">privacy notice</Link>.</p>
            <button data-testid="reg-submit" disabled={loading} className="npw-btn-primary">{loading? "Creating account…" : "Create account →"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
