import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";

export default function LostDetail() {
  const { id } = useParams();
  const [lost, setLost] = useState(null);
  useEffect(()=>{ api.get(`/lost/${id}`).then(r=>setLost(r.data)); }, [id]);
  if (!lost) return <div className="p-12 text-center">Loading…</div>;
  const p = lost.pet || {};
  return (
    <div className="max-w-3xl mx-auto px-4 py-12" data-testid="lost-detail-page">
      <div>
        {p.photo_url && <img src={p.photo_url} alt={p.name} className="w-full h-80 object-cover rounded-md"/>}
        <div className="pt-8">
          <span className="gpr-badge-lost">Lost</span>
          <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-3">{p.name}</h1>
          <div className="text-[var(--gpr-muted)] mt-1">{p.breed || p.species}</div>
          <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="gpr-eyebrow">Last seen</dt><dd className="mt-1">{lost.last_seen_location}</dd></div>
            <div><dt className="gpr-eyebrow">Date</dt><dd className="mt-1">{lost.last_seen_date}</dd></div>
            <div className="sm:col-span-2"><dt className="gpr-eyebrow">Description</dt><dd className="mt-1">{lost.description}</dd></div>
            {lost.reward && <div><dt className="gpr-eyebrow">Reward</dt><dd className="mt-1">{lost.reward}</dd></div>}
          </dl>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link to={`/report-sighting/${lost.id}`} data-testid="lost-report-sighting" className="gpr-btn-alert">Report a sighting</Link>
            <Link to={`/p/${p.id}`} className="gpr-btn-secondary">View pet profile</Link>
          </div>
          <p className="mt-6 text-xs text-[var(--gpr-muted)]">{lost.alerts_sent || 0} members alerted within 10 miles.</p>
        </div>
      </div>
    </div>
  );
}
