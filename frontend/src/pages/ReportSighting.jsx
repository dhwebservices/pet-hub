import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";

export default function ReportSighting() {
  const { lostId } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState({ lost_report_id: lostId, location:"", notes:"", photo_url:"", reporter_name:"", reporter_email:"", reporter_phone:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));
  const upload = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    const fd = new FormData(); fd.append("file", file);
    try { const { data } = await api.post("/upload/public-image", fd, { headers: { "Content-Type": "multipart/form-data" } }); set("photo_url", data.url); } catch {}
  };
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await api.post("/sightings", f); nav(`/lost/${lostId}?reported=1`); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };
  return (
    <div data-testid="report-sighting-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <header className="md:col-span-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-alert)] mb-6">Sighting Report</div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[0.98]">You may have <em className="accent text-[var(--gpr-alert)]">just helped</em> someone find their pet.</h1>
        <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 leading-[1.6]">The owner is notified the moment you submit. Please be as accurate as you can — even a slightly-blurry photo is invaluable.</p>
      </header>
      <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-10">
        <div><label className="gpr-label">Location of sighting</label><input data-testid="sighting-location" required className="gpr-input" value={f.location} onChange={e=>set('location', e.target.value)}/></div>
        <div><label className="gpr-label">What did you see?</label><textarea data-testid="sighting-notes" required className="gpr-input min-h-[120px] resize-y" rows={4} value={f.notes} onChange={e=>set('notes', e.target.value)}/></div>
        <div><label className="gpr-label">Photograph (optional)</label><input type="file" accept="image/*" onChange={upload} className="text-sm"/>{f.photo_url && <img src={f.photo_url} alt="" className="w-32 h-32 object-cover mt-3"/>}</div>
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
          <button data-testid="sighting-submit" disabled={loading} className="gpr-btn-alert">{loading? "Submitting…" : "Submit sighting →"}</button>
        </div>
      </form>
    </div>
  );
}
