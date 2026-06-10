import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function FoundPets() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/found").then(r=>setItems(r.data)); }, []);
  return (
    <div data-testid="found-pets-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-12">
        <div className="grid md:grid-cols-12 gap-x-10 items-end">
          <div className="md:col-span-8">
            <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">The Recovery Index · Found</div>
            <h1 className="font-extrabold text-5xl md:text-7xl text-[var(--npw-text)] leading-[0.95]">Pets <span className="text-[var(--npw-success)]">awaiting</span> their owners.</h1>
            <p className="text-[var(--npw-muted)] text-lg md:text-xl mt-6 max-w-2xl">Open reports from finders, vets and rescues. If you recognise one, write to the contact on the report — owners are usually within an hour of home.</p>
          </div>
          <div className="md:col-span-3 md:col-start-10 mt-6 md:mt-0 text-right">
            <Link to="/report-found" className="npw-link">Report a found pet →</Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {items.length === 0 ? (
          <div className="border-t border-[var(--npw-border)] py-20 text-center text-[var(--npw-muted)]" data-testid="found-empty">No open found reports at this moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 border-t border-[var(--npw-border)] pt-16">
            {items.map((it, i) => (
              <article key={it.id} data-testid={`found-card-${it.id}`} className="flex flex-col">
                <div className="npw-eyebrow text-[var(--npw-muted)] mb-3">№ {String(i+1).padStart(2,'0')} &middot; {it.created_at?.slice(0,10)}</div>
                <div className="aspect-[4/5] bg-[var(--npw-canvas)] overflow-hidden">
                  {it.photo_url ? <img src={it.photo_url} alt="" className="w-full h-full object-cover"/> :
                    <div className="w-full h-full flex items-center justify-center text-[var(--npw-muted)] text-xs">No photograph</div>}
                </div>
                <div className="mt-5">
                  <span className="npw-badge-found">Found</span>
                  <h3 className="font-extrabold text-2xl text-[var(--npw-text)] capitalize mt-2">{it.breed || it.species}</h3>
                  <p className="text-[var(--npw-muted)] mt-1">Reported at {it.location}</p>
                  {it.notes && <p className="text-[15px] text-[var(--npw-text)] mt-3 leading-[1.6] line-clamp-3">{it.notes}</p>}
                  {it.microchip && <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--npw-muted)] mt-3">Chip · {it.microchip}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
