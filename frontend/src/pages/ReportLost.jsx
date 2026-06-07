import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, fmtErr } from "../lib/auth";

export default function ReportLost() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [pets, setPets] = useState([]);
  const [f, setF] = useState({ pet_id:"", last_seen_date:"", last_seen_location:"", description:"", reward:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));

  useEffect(() => {
    if (user) api.get("/pets/mine").then(r => { setPets(r.data); if(r.data[0]) set('pet_id', r.data[0].id); });
  }, [user]);

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center" data-testid="report-lost-auth">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Sign in to report a lost pet</h1>
      <p className="text-[var(--gpr-muted)] mt-3">You must have an account and a registered pet to file a lost report.</p>
      <div className="mt-6 flex gap-3 justify-center"><Link to="/login" className="gpr-btn-primary">Sign in</Link><Link to="/register" className="gpr-btn-secondary">Register</Link></div>
    </div>
  );

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const { data } = await api.post("/lost", f); nav(`/lost/${data.id}`); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" data-testid="report-lost-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Report a lost pet</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Filing this alert will email every registered member within 10 miles of the last-seen postcode.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><label className="gpr-label">Pet</label>
          <select required data-testid="lost-pet-select" className="gpr-input" value={f.pet_id} onChange={e=>set('pet_id', e.target.value)}>
            <option value="">Choose a registered pet</option>
            {pets.map(p => <option key={p.id} value={p.id}>{p.name} — {p.breed || p.species}</option>)}
          </select>
          {pets.length === 0 && <p className="text-xs text-[var(--gpr-muted)] mt-1">No registered pets — <Link to="/register-pet" className="font-semibold text-[var(--gpr-primary)]">register one first</Link>.</p>}
        </div>
        <div><label className="gpr-label">Last seen date</label><input data-testid="lost-date" type="date" required className="gpr-input" value={f.last_seen_date} onChange={e=>set('last_seen_date', e.target.value)}/></div>
        <div><label className="gpr-label">Last seen location (postcode preferred)</label>
          <input data-testid="lost-location" required className="gpr-input" placeholder="e.g. SW1A 1AA" value={f.last_seen_location} onChange={e=>set('last_seen_location', e.target.value)}/></div>
        <div><label className="gpr-label">Description &amp; circumstances</label><textarea data-testid="lost-description" required className="gpr-input" rows={4} value={f.description} onChange={e=>set('description', e.target.value)}/></div>
        <div><label className="gpr-label">Reward (optional)</label><input className="gpr-input" placeholder="e.g. £100" value={f.reward} onChange={e=>set('reward', e.target.value)}/></div>
        {err && <div data-testid="lost-error" className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="lost-submit" disabled={loading || !f.pet_id} className="gpr-btn-alert w-full">{loading? "Dispatching alerts…" : "File lost pet report &amp; alert network"}</button>
      </form>
    </div>
  );
}
