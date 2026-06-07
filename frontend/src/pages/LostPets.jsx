import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";

function PetCard({ item }) {
  const p = item.pet || {};
  return (
    <Link to={`/lost/${item.id}`} data-testid={`lost-card-${item.id}`} className="group flex flex-col">
      <div className="aspect-[4/3] bg-[var(--gpr-secondary)] overflow-hidden rounded-md">
        {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"/> :
          <div className="w-full h-full flex items-center justify-center text-[var(--gpr-muted)] text-sm">No photo</div>}
      </div>
      <div className="pt-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-3"><div className="font-display font-bold text-lg text-[var(--gpr-primary)]">{p.name || "Unknown"}</div><span className="gpr-badge-lost">Lost</span></div>
        <div className="text-sm text-[var(--gpr-muted)] mt-1">{p.breed || p.species}</div>
        <div className="mt-3 space-y-1 text-sm text-[var(--gpr-text)]">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--gpr-muted)]"/> {item.last_seen_location}</div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--gpr-muted)]"/> {item.last_seen_date}</div>
        </div>
      </div>
    </Link>
  );
}

export default function LostPets() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/lost").then(r=>setItems(r.data)); }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="lost-pets-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="gpr-eyebrow">Recovery feed</div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-1">Lost pets near the network</h1>
          <p className="text-[var(--gpr-muted)] mt-2 max-w-xl">Every report is geocoded and emailed to members within a 10-mile radius. Drop a sighting if you spot one.</p>
        </div>
        <Link to="/report-lost" className="gpr-link-alert">Report a lost pet <ArrowUpRight className="w-4 h-4"/></Link>
      </div>
      <div className="mt-10">
        {items.length === 0 ? (
          <div className="border-t border-[var(--gpr-border)] pt-8 text-center text-[var(--gpr-muted)]" data-testid="lost-empty">No active lost pet reports right now.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(it => <PetCard key={it.id} item={it}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
