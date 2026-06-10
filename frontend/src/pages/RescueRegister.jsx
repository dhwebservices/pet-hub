import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr, useAuth } from "../lib/auth";

export default function RescueRegister() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ organisation_name:"", contact_name:"", email:"", phone:"", address:"", postcode:"", country:"UK", registration_number:"", password:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));
  const passwordValid = f.password.length >= 10 && /[A-Z]/.test(f.password) && /[a-z]/.test(f.password) && /\d/.test(f.password) && /[^A-Za-z0-9]/.test(f.password);
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    if (!passwordValid) {
      setErr("Password must be at least 10 characters and include upper and lower case letters, a number and a symbol.");
      setLoading(false);
      return;
    }
    try { await api.post("/rescue/register", f); const me = await api.get("/auth/me"); setUser(me.data); nav("/dashboard"); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };
  return (
    <div data-testid="rescue-register-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <header className="md:col-span-5">
        <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">For Rescue Organisations</div>
        <h1 className="font-extrabold text-5xl md:text-6xl text-[var(--npw-text)] leading-[0.98]">Register your <span className="text-[var(--npw-accent)]">rescue</span>.</h1>
        <p className="text-[var(--npw-muted)] text-lg mt-7 leading-[1.6]">Verified rescues manage cases, contact owners securely and log reunifications. Charity number speeds verification.</p>
      </header>
      <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-10">
        <div><label className="npw-label">Organisation name</label><input required className="npw-input" value={f.organisation_name} onChange={e=>set('organisation_name', e.target.value)}/></div>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          <div><label className="npw-label">Contact name</label><input required className="npw-input" value={f.contact_name} onChange={e=>set('contact_name', e.target.value)}/></div>
          <div><label className="npw-label">Email</label><input required type="email" className="npw-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
          <div><label className="npw-label">Phone</label><input required className="npw-input" value={f.phone} onChange={e=>set('phone', e.target.value)}/></div>
          <div><label className="npw-label">Charity / registration number</label><input className="npw-input" value={f.registration_number} onChange={e=>set('registration_number', e.target.value)}/></div>
        </div>
        <div><label className="npw-label">Address</label><input required className="npw-input" value={f.address} onChange={e=>set('address', e.target.value)}/></div>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          <div><label className="npw-label">Postcode</label><input required className="npw-input" value={f.postcode} onChange={e=>set('postcode', e.target.value)}/></div>
          <div><label className="npw-label">Country</label><input className="npw-input" value={f.country} onChange={e=>set('country', e.target.value)}/></div>
        </div>
        <div>
          <label className="npw-label">Password</label>
          <input required type="password" minLength={10} className="npw-input" value={f.password} onChange={e=>set('password', e.target.value)}/>
          <span className="npw-hint mt-2">Use at least 10 characters, with upper and lower case letters, a number and a symbol.</span>
        </div>
        {err && <div className="text-sm text-[var(--npw-warn)] italic">{err}</div>}
        <div className="pt-6 border-t border-[var(--npw-border)] flex justify-end">
          <button data-testid="rescue-submit" disabled={loading} className="npw-btn-primary">{loading? "Submitting…" : "Submit for verification →"}</button>
        </div>
      </form>
    </div>
  );
}
