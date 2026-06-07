import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, API } from "../lib/api";

export default function PetProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  useEffect(()=>{ api.get(`/pets/${id}`).then(r=>setPet(r.data)).catch(()=>setPet(false)); }, [id]);
  if (pet === null) return <div className="py-24 text-center font-serif italic text-[var(--gpr-muted)]">Loading…</div>;
  if (!pet) return <div className="py-24 text-center font-serif italic text-[var(--gpr-muted)]" data-testid="pet-not-found">No record was found at this index.</div>;
  return (
    <div data-testid="pet-profile-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)]">Pet Profile · Public Record · {pet.id.slice(0,8).toUpperCase()}</div>
      <div className="mt-6 grid md:grid-cols-12 gap-x-14 gap-y-10">
        <figure className="md:col-span-7">
          <div className="aspect-[4/5] md:aspect-[3/4] bg-[var(--gpr-secondary)] overflow-hidden">
            {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover"/> : null}
          </div>
          <figcaption className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-3">Photographed by the owner &middot; on file with the registry.</figcaption>
        </figure>
        <div className="md:col-span-5">
          <span className={pet.status==='lost'?'gpr-badge-lost':'gpr-badge-registered'}>{pet.status}</span>
          <h1 className="font-display font-extrabold text-6xl md:text-7xl text-[var(--gpr-primary)] mt-4 leading-[0.95]">{pet.name}</h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-xl mt-3">{[pet.breed, pet.species, pet.color].filter(Boolean).join(", ")}</p>

          {pet.status === 'lost' && (
            <p className="font-serif italic text-[var(--gpr-alert)] text-lg mt-8 border-l-2 border-[var(--gpr-alert)] pl-5">Currently reported missing. If found, please call the emergency contact below or report a sighting.</p>
          )}

          <dl className="mt-10 space-y-6 text-[15px]">
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-[var(--gpr-border)]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] pt-1">Contact</dt>
              <dd className="col-span-2"><div className="font-semibold text-[var(--gpr-primary)]">{pet.emergency_contact_name || "—"}</div>{pet.emergency_contact_phone && <a className="font-mono text-sm text-[var(--gpr-primary)] mt-1 block" href={`tel:${pet.emergency_contact_phone}`}>{pet.emergency_contact_phone}</a>}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-[var(--gpr-border)]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] pt-1">Area</dt>
              <dd className="col-span-2 text-[var(--gpr-text)]">{pet.owner_public?.town || "—"}{pet.owner_public?.county ? ", " + pet.owner_public.county : ""} <span className="font-serif italic text-[var(--gpr-muted)] text-[13px] block mt-1">Home address withheld.</span></dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-[var(--gpr-border)]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] pt-1">Medical</dt>
              <dd className="col-span-2 text-[var(--gpr-text)]">{pet.medical_conditions || <span className="font-serif italic text-[var(--gpr-muted)]">None reported.</span>}{pet.medication && <><br/><span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gpr-muted)]">Medication</span><br/>{pet.medication}</>}</dd>
            </div>
            {pet.microchip && (
              <div className="grid grid-cols-3 gap-4 py-3 border-t border-[var(--gpr-border)] border-b">
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] pt-1">Chip</dt>
                <dd className="col-span-2 font-mono text-[var(--gpr-text)]">{pet.microchip}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a href={`${API}/pets/${id}/qr`} target="_blank" rel="noreferrer" data-testid="download-qr" className="gpr-link">View QR record →</a>
            <Link to="/lost-pets" className="gpr-link">Recovery index →</Link>
          </div>
          <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-10">Verified record &middot; audit-logged &middot; home address withheld for safety.</p>
        </div>
      </div>
    </div>
  );
}
