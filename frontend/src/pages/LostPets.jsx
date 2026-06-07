import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Row({ item, idx }) {
  const p = item.pet || {};
  return (
    <Link to={`/lost/${item.id}`} data-testid={`lost-card-${item.id}`} className="group grid grid-cols-12 gap-x-6 md:gap-x-10 py-8 md:py-10 border-t border-[var(--gpr-border)] items-start">
      <div className="col-span-12 md:col-span-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] pt-2">№ {String(idx+1).padStart(2,'0')}</div>
      <div className="col-span-5 md:col-span-3">
        <div className="aspect-[4/5] bg-[var(--gpr-secondary)] overflow-hidden">
          {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-700"/> :
            <div className="w-full h-full flex items-center justify-center text-[var(--gpr-muted)] text-xs">No photograph</div>}
        </div>
      </div>
      <div className="col-span-7 md:col-span-5">
        <span className="gpr-badge-lost">Lost</span>
        <h3 className="font-display font-extrabold text-3xl md:text-4xl text-[var(--gpr-primary)] mt-3 leading-[1.05]">{p.name || "Unknown"}</h3>
        <p className="font-serif italic text-[var(--gpr-muted)] text-base md:text-lg mt-2">{p.breed || p.species}{p.color ? `, ${p.color}` : ""}</p>
        <p className="text-[15px] text-[var(--gpr-text)] mt-5 leading-[1.6] line-clamp-3">{item.description}</p>
      </div>
      <div className="col-span-12 md:col-span-3 md:pt-2 text-[13px] text-[var(--gpr-muted)] mt-4 md:mt-0">
        <div className="font-mono uppercase tracking-[0.15em] text-[11px] text-[var(--gpr-muted)]">Last seen</div>
        <div className="mt-1 text-[var(--gpr-text)]">{item.last_seen_location}</div>
        <div className="mt-3 font-mono uppercase tracking-[0.15em] text-[11px] text-[var(--gpr-muted)]">Date</div>
        <div className="mt-1 text-[var(--gpr-text)]">{item.last_seen_date}</div>
        <span className="gpr-link-alert mt-6 text-sm">Read &amp; report a sighting →</span>
      </div>
    </Link>
  );
}

export default function LostPets() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/lost").then(r=>setItems(r.data)); }, []);
  return (
    <div data-testid="lost-pets-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
        <div className="grid md:grid-cols-12 gap-x-10 items-end">
          <div className="md:col-span-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">The Recovery Index · Lost</div>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--gpr-primary)] leading-[0.95]">Pets currently <em className="accent text-[var(--gpr-alert)]">missing</em>.</h1>
            <p className="font-serif italic text-[var(--gpr-muted)] text-lg md:text-xl mt-6 max-w-2xl">Each report has been emailed to every registered member within a ten-mile radius. If you've seen any of them, a single sighting is often enough.</p>
          </div>
          <div className="md:col-span-3 md:col-start-10 mt-6 md:mt-0 text-right">
            <Link to="/report-lost" className="gpr-link-alert">Report a lost pet →</Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {items.length === 0 ? (
          <div className="border-t border-[var(--gpr-border)] py-20 text-center font-serif italic text-[var(--gpr-muted)]" data-testid="lost-empty">The Index is quiet — no active reports at this moment.</div>
        ) : (
          <div className="border-b border-[var(--gpr-border)]">
            {items.map((it, i) => <Row key={it.id} item={it} idx={i}/>)}
          </div>
        )}
      </section>
    </div>
  );
}
