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
    try {
      await api.post("/vet/register", f);
      const me = await api.get("/auth/me"); setUser(me.data);
      nav("/dashboard");
    } catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-12" data-testid="vet-register-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Veterinary registration</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Verified practices can submit found reports, verify pets and confirm reunifications.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><label className="gpr-label">Practice name</label><input required className="gpr-input" value={f.practice_name} onChange={e=>set('practice_name', e.target.value)}/></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="gpr-label">Contact name</label><input required className="gpr-input" value={f.contact_name} onChange={e=>set('contact_name', e.target.value)}/></div>
          <div><label className="gpr-label">Email</label><input required type="email" className="gpr-input" value={f.email} onChange={e=>set('email', e.target.value)}/></div>
          <div><label className="gpr-label">Phone</label><input required className="gpr-input" value={f.phone} onChange={e=>set('phone', e.target.value)}/></div>
          <div><label className="gpr-label">Licence number</label><input className="gpr-input" value={f.license_number} onChange={e=>set('license_number', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Address</label><input required className="gpr-input" value={f.address} onChange={e=>set('address', e.target.value)}/></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="gpr-label">Postcode</label><input required className="gpr-input" value={f.postcode} onChange={e=>set('postcode', e.target.value)}/></div>
          <div><label className="gpr-label">Country</label><input className="gpr-input" value={f.country} onChange={e=>set('country', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Password</label><input required type="password" minLength={8} className="gpr-input" value={f.password} onChange={e=>set('password', e.target.value)}/></div>
        {err && <div className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="vet-submit" disabled={loading} className="gpr-btn-primary w-full">{loading? "Submitting…" : "Register practice (pending verification)"}</button>
      </form>
    </div>
  );
}
