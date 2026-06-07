import React, { useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export default function SearchPets() {
  const [q, setQ] = useState("");
  const [species, setSpecies] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e?.preventDefault(); setLoading(true);
    const params = new URLSearchParams(); if(q) params.set('q', q); if(species) params.set('species', species);
    try { const { data } = await api.get(`/search?${params.toString()}`); setResults(data); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="search-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Search the registry</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Search by pet name, breed or microchip number.</p>
      <form onSubmit={run} className="mt-8 flex flex-wrap gap-4 items-end border-y border-[var(--gpr-border)] py-6">
        <div className="flex-1 min-w-[220px]"><label className="gpr-label">Keyword</label>
          <input data-testid="search-input" className="gpr-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Name, breed, microchip…"/></div>
        <div><label className="gpr-label">Species</label>
          <select className="gpr-input" value={species} onChange={e=>setSpecies(e.target.value)}>
            <option value="">All</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="other">Other</option>
          </select></div>
        <button data-testid="search-submit" className="gpr-btn-primary">{loading?"Searching…":"Search"}</button>
      </form>
      <div className="mt-8">
        {results.length === 0 ? (
          <div className="text-sm text-[var(--gpr-muted)]">No results yet. Try searching.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(p => (
              <Link to={`/p/${p.id}`} key={p.id} className="group">
                <div className="aspect-[4/3] bg-[var(--gpr-secondary)] rounded-md overflow-hidden">{p.photo_url && <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"/>}</div>
                <div className="pt-4">
                  <div className="font-display font-bold text-[var(--gpr-primary)]">{p.name}</div>
                  <div className="text-sm text-[var(--gpr-muted)]">{p.breed || p.species}</div>
                  <span className={`mt-2 inline-block ${p.status==='lost'?'gpr-badge-lost':p.status==='found'?'gpr-badge-found':'gpr-badge-registered'}`}>{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
