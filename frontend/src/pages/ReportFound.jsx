import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";

export default function ReportFound() {
  const nav = useNavigate();
  const [f, setF] = useState({ species:"dog", breed:"", color:"", location:"", notes:"", microchip:"", photo_url:"", reporter_name:"", reporter_email:"", reporter_phone:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
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
    <div data-testid="report-found-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <header className="md:col-span-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">Public Report · Found Pet</div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[0.98]">You've found <em className="accent text-[var(--gpr-success)]">someone's pet</em>.</h1>
        <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 leading-[1.6]">Add as much detail as you can. If you have a microchip number, the registry will try to contact the owner automatically.</p>
      </header>
      <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-10">
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
          <div><label className="gpr-label">Species</label><select className="gpr-input" value={f.species} onChange={e=>set('species', e.target.value)}><option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="other">Other</option></select></div>
          <div><label className="gpr-label">Breed (if known)</label><input className="gpr-input" value={f.breed} onChange={e=>set('breed', e.target.value)}/></div>
          <div><label className="gpr-label">Colour</label><input className="gpr-input" value={f.color} onChange={e=>set('color', e.target.value)}/></div>
          <div><label className="gpr-label">Microchip (if scanned)</label><input className="gpr-input" value={f.microchip} onChange={e=>set('microchip', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Location found</label><input data-testid="found-location" required className="gpr-input" value={f.location} onChange={e=>set('location', e.target.value)}/></div>
        <div><label className="gpr-label">Notes</label><textarea className="gpr-input min-h-[100px] resize-y" rows={3} value={f.notes} onChange={e=>set('notes', e.target.value)}/></div>
        <div><label className="gpr-label">Photograph</label><input type="file" accept="image/*" onChange={upload} className="text-sm"/>{f.photo_url && <img src={f.photo_url} alt="" className="w-32 h-32 object-cover mt-3"/>}</div>
        <fieldset className="pt-8 border-t border-[var(--gpr-border)] space-y-8">
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-2">Your details</legend>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            <div><label className="gpr-label">Your name</label><input required className="gpr-input" value={f.reporter_name} onChange={e=>set('reporter_name', e.target.value)}/></div>
            <div><label className="gpr-label">Email</label><input required type="email" className="gpr-input" value={f.reporter_email} onChange={e=>set('reporter_email', e.target.value)}/></div>
            <div className="sm:col-span-2"><label className="gpr-label">Phone (optional)</label><input className="gpr-input" value={f.reporter_phone} onChange={e=>set('reporter_phone', e.target.value)}/></div>
          </div>
        </fieldset>
        {err && <div className="text-sm text-[var(--gpr-alert)] font-serif italic">{err}</div>}
        <div className="pt-6 border-t border-[var(--gpr-border)] flex justify-end">
          <button data-testid="found-submit" disabled={loading} className="gpr-btn-primary">{loading? "Submitting…" : "Submit found-pet report →"}</button>
        </div>
      </form>
    </div>
  );
}
