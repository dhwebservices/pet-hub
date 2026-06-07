import React, { useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export default function SearchPets() {
  const [q, setQ] = useState(""); const [species, setSpecies] = useState("");
  const [results, setResults] = useState([]); const [loading, setLoading] = useState(false);
  const run = async (e) => {
    e?.preventDefault(); setLoading(true);
    const params = new URLSearchParams(); if(q) params.set('q', q); if(species) params.set('species', species);
    try { const { data } = await api.get(`/search?${params.toString()}`); setResults(data); } finally { setLoading(false); }
  };
  return (
    <div data-testid="search-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <header className="grid md:grid-cols-12 gap-x-14 mb-12">
        <div className="md:col-span-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">The Registry · Search</div>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--gpr-primary)] leading-[0.98]">Find a <em className="accent text-[var(--gpr-alert)]">record</em>.</h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 max-w-xl leading-[1.6]">Search by pet name, breed or microchip number across all public registry records.</p>
        </div>
      </header>
      <form onSubmit={run} className="grid md:grid-cols-12 gap-x-10 gap-y-6 items-end border-t border-b border-[var(--gpr-border)] py-8">
        <div className="md:col-span-7">
          <label className="gpr-label">Keyword</label>
          <input data-testid="search-input" className="gpr-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Name, breed or microchip…"/>
        </div>
        <div className="md:col-span-3">
          <label className="gpr-label">Species</label>
          <select className="gpr-input" value={species} onChange={e=>setSpecies(e.target.value)}>
            <option value="">All</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2 md:text-right"><button data-testid="search-submit" className="gpr-btn-primary">{loading?"Searching…":"Search →"}</button></div>
      </form>
      <section className="mt-12">
        {results.length === 0 ? (
          <p className="font-serif italic text-[var(--gpr-muted)]">No results yet — try a search above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {results.map((p, i) => (
              <Link to={`/p/${p.id}`} key={p.id} className="group">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-3">№ {String(i+1).padStart(2,'0')}</div>
                <div className="aspect-[4/5] bg-[var(--gpr-secondary)] overflow-hidden">{p.photo_url && <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"/>}</div>
                <div className="mt-4">
                  <span className={p.status==='lost'?'gpr-badge-lost':p.status==='found'?'gpr-badge-found':'gpr-badge-registered'}>{p.status}</span>
                  <h3 className="font-display font-extrabold text-2xl text-[var(--gpr-primary)] mt-2">{p.name}</h3>
                  <p className="font-serif italic text-[var(--gpr-muted)] mt-1">{p.breed || p.species}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
