import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function LostDetail() {
  const { id } = useParams();
  const [lost, setLost] = useState(null);
  useEffect(()=>{ api.get(`/lost/${id}`).then(r=>setLost(r.data)); }, [id]);
  if (!lost) return <div className="py-24 text-center font-serif italic text-[var(--gpr-muted)]">Loading…</div>;
  const p = lost.pet || {};
  return (
    <div data-testid="lost-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)]">Recovery Bulletin · {lost.id.slice(0,8).toUpperCase()}</div>
      <div className="mt-6 grid md:grid-cols-12 gap-x-14 gap-y-10">
        <figure className="md:col-span-7">
          {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-[600px] object-cover"/> : <div className="aspect-[4/5] bg-[var(--gpr-secondary)]"/>}
          <figcaption className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-3">{p.name} — photographed by the owner.</figcaption>
        </figure>
        <div className="md:col-span-5">
          <span className="gpr-badge-lost">Lost</span>
          <h1 className="font-display font-extrabold text-6xl md:text-7xl text-[var(--gpr-primary)] mt-4 leading-[0.95]">{p.name}</h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-xl mt-3">{p.breed || p.species}</p>

          <dl className="mt-10 space-y-1 text-[15px]">
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--gpr-border)]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)]">Last seen</dt>
              <dd className="col-span-2 text-[var(--gpr-text)]">{lost.last_seen_location}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--gpr-border)]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)]">Date</dt>
              <dd className="col-span-2 text-[var(--gpr-text)]">{lost.last_seen_date}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--gpr-border)]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)]">Description</dt>
              <dd className="col-span-2 text-[var(--gpr-text)] leading-[1.6]">{lost.description}</dd>
            </div>
            {lost.reward && (
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--gpr-border)] border-b">
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)]">Reward</dt>
                <dd className="col-span-2 text-[var(--gpr-text)] font-semibold">{lost.reward}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link to={`/report-sighting/${lost.id}`} data-testid="lost-report-sighting" className="gpr-link-alert">Report a sighting →</Link>
            <Link to={`/p/${p.id}`} className="gpr-link">View pet profile →</Link>
          </div>
          <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-10">{lost.alerts_sent || 0} members alerted within ten miles of the last-seen location.</p>
        </div>
      </div>
    </div>
  );
}
