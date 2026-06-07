import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";

export default function FoundPets() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/found").then(r=>setItems(r.data)); }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="found-pets-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="gpr-eyebrow">Open cases</div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-1">Found pets awaiting owners</h1>
          <p className="text-[var(--gpr-muted)] mt-2 max-w-xl">Public reports from finders, vets and rescues. If you recognise one, contact us through the report.</p>
        </div>
        <Link to="/report-found" className="gpr-link">Report a found pet <ArrowUpRight className="w-4 h-4"/></Link>
      </div>
      <div className="mt-10">
        {items.length === 0 ? (
          <div className="border-t border-[var(--gpr-border)] pt-8 text-center text-[var(--gpr-muted)]" data-testid="found-empty">No open found reports right now.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(it => (
              <div key={it.id} data-testid={`found-card-${it.id}`} className="flex flex-col group">
                <div className="aspect-[4/3] bg-[var(--gpr-secondary)] rounded-md overflow-hidden">
                  {it.photo_url ? <img src={it.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"/> :
                    <div className="w-full h-full flex items-center justify-center text-[var(--gpr-muted)] text-sm">No photo</div>}
                </div>
                <div className="pt-4 flex-1">
                  <div className="flex items-center justify-between gap-3"><div className="font-display font-bold text-lg capitalize text-[var(--gpr-primary)]">{it.species}</div><span className="gpr-badge-found">Found</span></div>
                  <div className="text-sm text-[var(--gpr-muted)] mt-1">{it.breed || "Unknown breed"}</div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--gpr-muted)]"/>{it.location}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--gpr-muted)]"/>{it.created_at?.slice(0,10)}</div>
                  </div>
                  {it.microchip && <div className="text-xs mt-2 text-[var(--gpr-muted)]">Microchip: {it.microchip}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
