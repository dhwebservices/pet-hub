import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr, useAuth } from "../lib/auth";

export default function VetRegister() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ practice_name:"", contact_name:"", email:"", phone:"", address:"", postcode:"", country:"UK", license_number:"", password:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await api.post("/vet/register", f); const me = await api.get("/auth/me"); setUser(me.data); nav("/dashboard"); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };
  return (
    <div data-testid="vet-register-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <header className="md:col-span-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">For Veterinary Practices</div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[0.98]">Register your <em className="accent text-[var(--gpr-alert)]">practice</em>.</h1>
        <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 leading-[1.6]">Verified practices submit found reports, scan microchip records and confirm reunifications directly. Verification typically takes one working day.</p>
      </header>
      <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-10">
        <div><label className="gpr-label">Practice name</label><input required className="gpr-input" value={f.practice_name} onChange={e=>set('practice_name', e.target.value)}/></div>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          <div><label className="gpr-label">Contact name</label><input required className="gpr-input" value={f.contact_name} onChange={e=>set('contact_name', e.target.value)}/></div>
          <div><label className="gpr-label">Email</label><input required type="email" className="gpr-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
          <div><label className="gpr-label">Phone</label><input required className="gpr-input" value={f.phone} onChange={e=>set('phone', e.target.value)}/></div>
          <div><label className="gpr-label">RCVS / licence number</label><input className="gpr-input" value={f.license_number} onChange={e=>set('license_number', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Address</label><input required className="gpr-input" value={f.address} onChange={e=>set('address', e.target.value)}/></div>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          <div><label className="gpr-label">Postcode</label><input required className="gpr-input" value={f.postcode} onChange={e=>set('postcode', e.target.value)}/></div>
          <div><label className="gpr-label">Country</label><input className="gpr-input" value={f.country} onChange={e=>set('country', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Password</label><input required type="password" minLength={8} className="gpr-input" value={f.password} onChange={e=>set('password', e.target.value)}/></div>
        {err && <div className="text-sm text-[var(--gpr-alert)] font-serif italic">{err}</div>}
        <div className="pt-6 border-t border-[var(--gpr-border)] flex justify-end">
          <button data-testid="vet-submit" disabled={loading} className="gpr-btn-primary">{loading? "Submitting…" : "Submit for verification →"}</button>
        </div>
      </form>
    </div>
  );
}
