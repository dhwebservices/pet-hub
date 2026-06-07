import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";

export default function ReportFound() {
  const nav = useNavigate();
  const [f, setF] = useState({ species:"dog", breed:"", color:"", location:"", notes:"", microchip:"", photo_url:"", reporter_name:"", reporter_email:"", reporter_phone:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));

  const upload = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    const fd = new FormData(); fd.append("file", file);
    try { const { data } = await api.post("/upload/public-image", fd, { headers: { "Content-Type": "multipart/form-data" } }); set("photo_url", data.url); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); }
  };

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await api.post("/found", f); nav("/found-pets"); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" data-testid="report-found-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Report a found pet</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Add as much detail as possible. If you have a microchip number, we will attempt to notify the owner automatically.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="gpr-label">Species</label>
            <select className="gpr-input" value={f.species} onChange={e=>set('species', e.target.value)}>
              <option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="other">Other</option>
            </select></div>
          <div><label className="gpr-label">Breed (if known)</label><input className="gpr-input" value={f.breed} onChange={e=>set('breed', e.target.value)}/></div>
          <div><label className="gpr-label">Colour</label><input className="gpr-input" value={f.color} onChange={e=>set('color', e.target.value)}/></div>
          <div><label className="gpr-label">Microchip number (if scanned)</label><input className="gpr-input" value={f.microchip} onChange={e=>set('microchip', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Location found (postcode preferred)</label>
          <input data-testid="found-location" required className="gpr-input" value={f.location} onChange={e=>set('location', e.target.value)}/></div>
        <div><label className="gpr-label">Notes</label><textarea className="gpr-input" rows={3} value={f.notes} onChange={e=>set('notes', e.target.value)}/></div>
        <div><label className="gpr-label">Photo</label><input type="file" accept="image/*" onChange={upload}/></div>
        {f.photo_url && <img src={f.photo_url} alt="" className="w-32 h-32 object-cover rounded-md border border-[var(--gpr-border)]"/>}
        <div className="border-t border-[var(--gpr-border)] pt-4 grid sm:grid-cols-2 gap-4">
          <div><label className="gpr-label">Your name</label><input required className="gpr-input" value={f.reporter_name} onChange={e=>set('reporter_name', e.target.value)}/></div>
          <div><label className="gpr-label">Your email</label><input required type="email" className="gpr-input" value={f.reporter_email} onChange={e=>set('reporter_email', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Phone (optional)</label><input className="gpr-input" value={f.reporter_phone} onChange={e=>set('reporter_phone', e.target.value)}/></div>
        {err && <div className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="found-submit" disabled={loading} className="gpr-btn-primary w-full">{loading? "Submitting…" : "Submit found pet report"}</button>
      </form>
    </div>
  );
}
