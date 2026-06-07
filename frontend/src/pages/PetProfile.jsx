import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, API } from "../lib/api";
import { Phone, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";

export default function PetProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  useEffect(()=>{ api.get(`/pets/${id}`).then(r=>setPet(r.data)).catch(()=>setPet(false)); }, [id]);
  if (pet === null) return <div className="p-12 text-center text-[var(--gpr-muted)]">Loading…</div>;
  if (!pet) return <div className="p-12 text-center" data-testid="pet-not-found">Pet not found.</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-12" data-testid="pet-profile-page">
      <div className="overflow-hidden">
        <div className="aspect-[16/9] bg-[var(--gpr-secondary)] rounded-md overflow-hidden">
          {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover"/> : null}
        </div>
        <div className="pt-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">{pet.name}</h1>
            <span className={pet.status==='lost'?'gpr-badge-lost':'gpr-badge-registered'}>{pet.status}</span>
          </div>
          <div className="mt-2 text-[var(--gpr-muted)]">{[pet.breed, pet.species, pet.color].filter(Boolean).join(" · ")}</div>

          {pet.status === 'lost' && (
            <div className="mt-6 p-4 rounded-md bg-[#FDF2F0] border border-[#FADCD5] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--gpr-alert)] mt-0.5"/>
              <div className="text-sm text-[var(--gpr-alert)] font-medium">This pet is currently reported as missing. If found, please contact the emergency number below or report a sighting.</div>
            </div>
          )}

          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            <div>
              <div className="gpr-eyebrow mb-2">Emergency contact</div>
              <div className="font-display font-bold text-lg">{pet.emergency_contact_name || "—"}</div>
              {pet.emergency_contact_phone && <a className="flex items-center gap-2 text-[var(--gpr-primary)] font-semibold mt-1" href={`tel:${pet.emergency_contact_phone}`}><Phone className="w-4 h-4"/> {pet.emergency_contact_phone}</a>}
            </div>
            <div>
              <div className="gpr-eyebrow mb-2">Approximate area</div>
              <div className="flex items-center gap-2 text-[var(--gpr-text)]"><MapPin className="w-4 h-4 text-[var(--gpr-muted)]"/> {pet.owner_public?.town || ""}{pet.owner_public?.county ? ", " + pet.owner_public.county : ""}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="gpr-eyebrow mb-2">Medical alerts</div>
              <div className="text-sm">{pet.medical_conditions || "None reported."}</div>
              {pet.medication && <div className="text-sm mt-1"><strong>Medication:</strong> {pet.medication}</div>}
            </div>
            {pet.microchip && (
              <div className="sm:col-span-2">
                <div className="gpr-eyebrow mb-2">Microchip</div>
                <div className="font-mono text-sm">{pet.microchip}</div>
              </div>
            )}
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-[var(--gpr-muted)]"><ShieldCheck className="w-4 h-4 text-[var(--gpr-success)]"/> Verified record · home address withheld for safety.</div>
          <div className="mt-6 flex gap-3 flex-wrap">
            <a href={`${API}/pets/${id}/qr`} target="_blank" rel="noreferrer" data-testid="download-qr" className="gpr-btn-secondary">View QR code</a>
            <Link to="/lost-pets" className="gpr-btn-secondary">Recovery feed</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
