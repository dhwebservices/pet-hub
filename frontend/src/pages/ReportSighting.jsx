import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";

export default function ReportSighting() {
  const { lostId } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState({ lost_report_id: lostId, location:"", notes:"", photo_url:"", reporter_name:"", reporter_email:"", reporter_phone:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="max-w-2xl mx-auto px-4 py-12" data-testid="report-sighting-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Report a sighting</h1>
      <p className="text-[var(--gpr-muted)] mt-2">The owner will be notified immediately. Please be as accurate as possible.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><label className="gpr-label">Location of sighting (postcode preferred)</label>
          <input data-testid="sighting-location" required className="gpr-input" value={f.location} onChange={e=>set('location', e.target.value)}/></div>
        <div><label className="gpr-label">Notes</label><textarea data-testid="sighting-notes" required className="gpr-input" rows={4} value={f.notes} onChange={e=>set('notes', e.target.value)}/></div>
        <div><label className="gpr-label">Photo (optional)</label><input type="file" accept="image/*" onChange={upload}/></div>
        {f.photo_url && <img src={f.photo_url} alt="" className="w-32 h-32 object-cover rounded-md"/>}
        <div className="grid sm:grid-cols-2 gap-4 border-t border-[var(--gpr-border)] pt-4">
          <div><label className="gpr-label">Your name</label><input required className="gpr-input" value={f.reporter_name} onChange={e=>set('reporter_name', e.target.value)}/></div>
          <div><label className="gpr-label">Your email</label><input required type="email" className="gpr-input" value={f.reporter_email} onChange={e=>set('reporter_email', e.target.value)}/></div>
        </div>
        <div><label className="gpr-label">Phone (optional)</label><input className="gpr-input" value={f.reporter_phone} onChange={e=>set('reporter_phone', e.target.value)}/></div>
        {err && <div className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="sighting-submit" disabled={loading} className="gpr-btn-primary w-full">{loading? "Submitting…" : "Submit sighting"}</button>
      </form>
    </div>
  );
}
