import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, fmtErr } from "../lib/auth";

export default function RegisterPet() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name:"", species:"dog", breed:"", gender:"", dob:"", color:"", weight:"", distinguishing_features:"", microchip:"", medical_conditions:"", medication:"", neutered:false, behaviour_notes:"", emergency_contact_name:"", emergency_contact_phone:"", photo_url:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false); const [uploading, setUploading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));

  const upload = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("photo_url", data.url);
    } catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await api.post("/pets", f); nav(`/dashboard`); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  if (!user) return <div className="py-24 text-center font-serif italic text-[var(--gpr-muted)]" data-testid="pet-register-auth-required">Please sign in to register a pet.</div>;

  return (
    <div data-testid="register-pet-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-10">
        <header className="md:col-span-4 md:sticky md:top-24 md:self-start">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">Pet Enrolment Form</div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[0.95]">Add a pet to the <em className="accent text-[var(--gpr-alert)]">registry</em>.</h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-6 leading-[1.6]">A complete record reunites faster. You can edit anything later. Only fields marked with an asterisk are required.</p>
        </header>

        <form onSubmit={submit} className="md:col-span-7 md:col-start-6 space-y-16">
          <Section n="i" title="Identity">
            <Grid>
              <Field label="Pet name *"><input data-testid="pet-name" required className="gpr-input" value={f.name} onChange={e=>set('name', e.target.value)}/></Field>
              <Field label="Species"><select data-testid="pet-species" className="gpr-input" value={f.species} onChange={e=>set('species', e.target.value)}><option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="reptile">Reptile</option><option value="other">Other</option></select></Field>
              <Field label="Breed"><input className="gpr-input" value={f.breed} onChange={e=>set('breed', e.target.value)}/></Field>
              <Field label="Gender"><select className="gpr-input" value={f.gender} onChange={e=>set('gender', e.target.value)}><option value="">—</option><option value="male">Male</option><option value="female">Female</option></select></Field>
              <Field label="Date of birth"><input type="date" className="gpr-input" value={f.dob} onChange={e=>set('dob', e.target.value)}/></Field>
              <Field label="Colour"><input className="gpr-input" value={f.color} onChange={e=>set('color', e.target.value)}/></Field>
              <Field label="Weight (kg)"><input className="gpr-input" value={f.weight} onChange={e=>set('weight', e.target.value)}/></Field>
              <Field label="Microchip number"><input data-testid="pet-microchip" className="gpr-input" value={f.microchip} onChange={e=>set('microchip', e.target.value)}/></Field>
            </Grid>
            <Field label="Distinguishing features"><textarea className="gpr-input min-h-[80px] resize-y" rows={2} value={f.distinguishing_features} onChange={e=>set('distinguishing_features', e.target.value)}/></Field>
          </Section>

          <Section n="ii" title="Photograph">
            <input data-testid="pet-photo-input" type="file" accept="image/*" onChange={upload} className="text-sm"/>
            {uploading && <div className="font-serif italic text-sm text-[var(--gpr-muted)] mt-3">Uploading…</div>}
            {f.photo_url && <img src={f.photo_url} alt="" className="w-48 h-48 object-cover mt-4"/>}
          </Section>

          <Section n="iii" title="Medical &amp; behaviour">
            <Field label="Medical conditions"><textarea className="gpr-input min-h-[80px] resize-y" rows={2} value={f.medical_conditions} onChange={e=>set('medical_conditions', e.target.value)}/></Field>
            <Field label="Medication"><textarea className="gpr-input min-h-[80px] resize-y" rows={2} value={f.medication} onChange={e=>set('medication', e.target.value)}/></Field>
            <label className="flex items-center gap-3 text-sm pt-3"><input type="checkbox" checked={f.neutered} onChange={e=>set('neutered', e.target.checked)}/> Neutered / spayed</label>
            <Field label="Behaviour notes"><textarea className="gpr-input min-h-[80px] resize-y" rows={2} value={f.behaviour_notes} onChange={e=>set('behaviour_notes', e.target.value)}/></Field>
          </Section>

          <Section n="iv" title="Emergency contact">
            <Grid>
              <Field label="Name"><input className="gpr-input" value={f.emergency_contact_name} onChange={e=>set('emergency_contact_name', e.target.value)}/></Field>
              <Field label="Phone"><input className="gpr-input" value={f.emergency_contact_phone} onChange={e=>set('emergency_contact_phone', e.target.value)}/></Field>
            </Grid>
          </Section>

          {err && <div data-testid="pet-error" className="text-sm text-[var(--gpr-alert)] font-serif italic">{err}</div>}
          <div className="pt-6 border-t border-[var(--gpr-border)] flex flex-wrap items-center justify-between gap-4">
            <p className="font-serif italic text-[13px] text-[var(--gpr-muted)]">A QR profile will be generated for you to print on a collar tag.</p>
            <button data-testid="pet-submit" disabled={loading} className="gpr-btn-primary">{loading? "Saving…" : "Register pet →"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({n, title, children}) {
  return (
    <section className="space-y-8">
      <div className="flex items-baseline gap-4 pb-3 border-b border-[var(--gpr-border)]">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)]">{n}</span>
        <h2 className="font-display font-extrabold text-2xl text-[var(--gpr-primary)]">{title}</h2>
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  );
}
function Grid({children}) { return <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">{children}</div>; }
function Field({label, children}) { return <div><label className="gpr-label">{label}</label>{children}</div>; }
