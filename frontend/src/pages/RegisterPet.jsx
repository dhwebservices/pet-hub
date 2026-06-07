import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, fmtErr } from "../lib/auth";

export default function RegisterPet() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name:"", species:"dog", breed:"", gender:"", dob:"", color:"", weight:"", distinguishing_features:"", microchip:"", medical_conditions:"", medication:"", neutered:false, behaviour_notes:"", emergency_contact_name:"", emergency_contact_phone:"", photo_url:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    try { const { data } = await api.post("/pets", f); nav(`/dashboard`); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail) || e.message); } finally { setLoading(false); }
  };

  if (!user) return <div className="max-w-2xl mx-auto px-4 py-16" data-testid="pet-register-auth-required"><h1 className="font-display font-bold text-2xl">Please sign in to register a pet.</h1></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" data-testid="register-pet-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Register a pet</h1>
      <p className="text-[var(--gpr-muted)] mt-2">A complete record helps reunite faster. You can edit anything later.</p>
      <form onSubmit={submit} className="mt-8 space-y-12">
        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg pb-2 border-b border-[var(--gpr-border)]">Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="gpr-label">Pet name</label><input data-testid="pet-name" required className="gpr-input" value={f.name} onChange={e=>set('name', e.target.value)}/></div>
            <div><label className="gpr-label">Species</label>
              <select data-testid="pet-species" className="gpr-input" value={f.species} onChange={e=>set('species', e.target.value)}>
                <option value="dog">Dog</option><option value="cat">Cat</option><option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="reptile">Reptile</option><option value="other">Other</option>
              </select></div>
            <div><label className="gpr-label">Breed</label><input className="gpr-input" value={f.breed} onChange={e=>set('breed', e.target.value)}/></div>
            <div><label className="gpr-label">Gender</label>
              <select className="gpr-input" value={f.gender} onChange={e=>set('gender', e.target.value)}>
                <option value="">—</option><option value="male">Male</option><option value="female">Female</option>
              </select></div>
            <div><label className="gpr-label">Date of birth</label><input type="date" className="gpr-input" value={f.dob} onChange={e=>set('dob', e.target.value)}/></div>
            <div><label className="gpr-label">Colour</label><input className="gpr-input" value={f.color} onChange={e=>set('color', e.target.value)}/></div>
            <div><label className="gpr-label">Weight (kg)</label><input className="gpr-input" value={f.weight} onChange={e=>set('weight', e.target.value)}/></div>
            <div><label className="gpr-label">Microchip number</label><input data-testid="pet-microchip" className="gpr-input" value={f.microchip} onChange={e=>set('microchip', e.target.value)}/></div>
          </div>
          <div><label className="gpr-label">Distinguishing features</label><textarea className="gpr-input" rows={2} value={f.distinguishing_features} onChange={e=>set('distinguishing_features', e.target.value)}/></div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg pb-2 border-b border-[var(--gpr-border)]">Photo</h2>
          <input data-testid="pet-photo-input" type="file" accept="image/*" onChange={upload}/>
          {uploading && <div className="text-sm text-[var(--gpr-muted)]">Uploading…</div>}
          {f.photo_url && <img src={f.photo_url} alt="" className="w-40 h-40 object-cover rounded-md border border-[var(--gpr-border)]"/>}
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg pb-2 border-b border-[var(--gpr-border)]">Medical &amp; behaviour</h2>
          <div><label className="gpr-label">Medical conditions</label><textarea className="gpr-input" rows={2} value={f.medical_conditions} onChange={e=>set('medical_conditions', e.target.value)}/></div>
          <div><label className="gpr-label">Medication requirements</label><textarea className="gpr-input" rows={2} value={f.medication} onChange={e=>set('medication', e.target.value)}/></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.neutered} onChange={e=>set('neutered', e.target.checked)}/> Neutered / spayed</label>
          <div><label className="gpr-label">Behaviour notes</label><textarea className="gpr-input" rows={2} value={f.behaviour_notes} onChange={e=>set('behaviour_notes', e.target.value)}/></div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg pb-2 border-b border-[var(--gpr-border)]">Emergency contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="gpr-label">Name</label><input className="gpr-input" value={f.emergency_contact_name} onChange={e=>set('emergency_contact_name', e.target.value)}/></div>
            <div><label className="gpr-label">Phone</label><input className="gpr-input" value={f.emergency_contact_phone} onChange={e=>set('emergency_contact_phone', e.target.value)}/></div>
          </div>
        </section>

        {err && <div data-testid="pet-error" className="text-sm text-[var(--gpr-alert)]">{err}</div>}
        <button data-testid="pet-submit" disabled={loading} className="gpr-btn-primary">{loading? "Saving…" : "Register pet"}</button>
      </form>
    </div>
  );
}
