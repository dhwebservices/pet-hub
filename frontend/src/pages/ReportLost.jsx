import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, fmtErr } from "../lib/auth";

export default function ReportLost() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [pets, setPets] = useState([]);
  const [f, setF] = useState({ pet_id:"", last_seen_date:"", last_seen_location:"", description:"", reward:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));

  useEffect(() => { if (user) api.get("/pets/mine").then(r => { setPets(r.data); if(r.data[0]) set('pet_id', r.data[0].id); }); }, [user]);

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center" data-testid="report-lost-auth">
      <h1 className="font-display font-extrabold text-4xl md:text-5xl text-[var(--gpr-primary)]">Sign in to file a <em className="accent text-[var(--gpr-alert)]">lost-pet report</em>.</h1>
      <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-6">You'll need an account and at least one registered pet before the network can dispatch.</p>
      <div className="mt-10 flex justify-center gap-x-10 text-sm"><Link to="/login" className="gpr-link">Sign in →</Link><Link to="/register" className="gpr-link">Register →</Link></div>
    </div>
  );

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const { data } = await api.post("/lost", f); nav(`/lost/${data.id}`); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  return (
    <div data-testid="report-lost-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-10">
        <header className="md:col-span-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-alert)] mb-6">Urgent · Lost-Pet Report</div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[0.98]">Tell us what happened. <em className="accent text-[var(--gpr-alert)]">We dispatch immediately.</em></h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 leading-[1.6]">Filing this report emails every registered member within ten miles of the last-seen postcode, with the photograph, the area, and a tap-to-sight link.</p>
          <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-10">Tip: an exact postcode dispatches more accurately than a street name. We never share your home address.</p>
        </header>

        <form onSubmit={submit} className="md:col-span-6 md:col-start-7 space-y-10">
          <div>
            <label className="gpr-label">Which pet?</label>
            <select required data-testid="lost-pet-select" className="gpr-input" value={f.pet_id} onChange={e=>set('pet_id', e.target.value)}>
              <option value="">— select a registered pet —</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name} · {p.breed || p.species}</option>)}
            </select>
            {pets.length === 0 && <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-3">You have no registered pets — <Link to="/register-pet" className="text-[var(--gpr-primary)] font-semibold border-b border-[var(--gpr-primary)]/40">register one first</Link>.</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
            <div><label className="gpr-label">Last seen date</label><input data-testid="lost-date" type="date" required className="gpr-input" value={f.last_seen_date} onChange={e=>set('last_seen_date', e.target.value)}/></div>
            <div><label className="gpr-label">Last seen — postcode preferred</label><input data-testid="lost-location" required className="gpr-input" placeholder="e.g. SW1A 1AA" value={f.last_seen_location} onChange={e=>set('last_seen_location', e.target.value)}/></div>
          </div>
          <div><label className="gpr-label">Description &amp; circumstances</label><textarea data-testid="lost-description" required className="gpr-input min-h-[140px] resize-y" rows={5} value={f.description} onChange={e=>set('description', e.target.value)}/></div>
          <div><label className="gpr-label">Reward (optional)</label><input className="gpr-input" placeholder="e.g. £100" value={f.reward} onChange={e=>set('reward', e.target.value)}/></div>
          {err && <div data-testid="lost-error" className="text-sm text-[var(--gpr-alert)] font-serif italic">{err}</div>}
          <div className="pt-6 border-t border-[var(--gpr-border)] flex flex-wrap items-center justify-between gap-4">
            <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] max-w-sm">By filing, you authorise the registry to email registered members within a ten-mile radius.</p>
            <button data-testid="lost-submit" disabled={loading || !f.pet_id} className="gpr-btn-alert">{loading? "Dispatching alerts…" : "File report &amp; alert the network →"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
