import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/pets/mine").then(r=>{setPets(r.data); setLoading(false);}).catch(()=>setLoading(false));
  }, [user]);
  if (!user) return <div className="py-24 text-center text-[var(--npw-muted)]">Please sign in.</div>;
  return (
    <div data-testid="dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
      <header className="grid md:grid-cols-12 gap-x-14 items-end">
        <div className="md:col-span-8">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-5">Member Dashboard · {new Date().toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'})}</div>
          <h1 className="font-extrabold text-5xl md:text-6xl text-[var(--npw-text)] leading-[1]">Welcome, <span className="text-[var(--npw-accent)]">{user.first_name}</span>.</h1>
          <p className="text-[var(--npw-muted)] text-lg mt-5 max-w-xl leading-[1.55]">Your registered pets, their alert profiles and your subscription — all in one place.</p>
        </div>
        <div className="md:col-span-3 md:col-start-10 mt-6 md:mt-0 text-right">
          <Link to="/register-pet" data-testid="dashboard-add-pet" className="npw-link">Register another pet →</Link>
        </div>
      </header>

      <div className="mt-16 grid md:grid-cols-12 gap-x-14 gap-y-12">
        <aside className="md:col-span-3">
          <div className="npw-eyebrow text-[var(--npw-muted)] mb-3">Account</div>
          <div className="font-bold text-lg text-[var(--npw-text)]">{user.first_name} {user.last_name}</div>
          <div className="italic text-sm text-[var(--npw-muted)] mt-1">{user.email}</div>
          <div className="mt-8 npw-eyebrow text-[var(--npw-muted)] mb-3">Plan</div>
          <div className="text-sm">{user.subscription_tier==='premium' ? <span className="text-[var(--npw-action)] font-semibold">Premium &middot; active</span> : <span className="text-[var(--npw-text)]">Free tier</span>}</div>
          <Link to="/subscribe" data-testid="dashboard-subscribe" className="npw-link mt-4 inline-flex text-sm">{user.subscription_tier==='premium'?'Manage':'Upgrade to Premium'} →</Link>
        </aside>

        <section className="md:col-span-9">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Your pets &middot; {pets.length} record{pets.length===1?"":"s"}</div>
          {loading ? <div className="text-[var(--npw-muted)]">Loading…</div> :
            pets.length === 0 ? (
              <div className="border-t border-[var(--npw-border)] pt-12 pb-12" data-testid="dashboard-empty">
                <p className="italic text-xl text-[var(--npw-muted)] max-w-md">No pets registered yet. Add your first to activate the alert network.</p>
                <Link to="/register-pet" className="npw-link mt-6 inline-flex">Register your first pet →</Link>
              </div>
            ) : (
              <div className="border-t border-[var(--npw-border)]">
                {pets.map((p, i) => (
                  <div key={p.id} data-testid={`my-pet-${p.id}`} className="grid grid-cols-12 gap-x-6 gap-y-3 py-8 border-b border-[var(--npw-border)] items-start">
                    <div className="col-span-12 md:col-span-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--npw-muted)] pt-2">№ {String(i+1).padStart(2,'0')}</div>
                    <div className="col-span-4 md:col-span-3"><div className="aspect-[4/5] bg-[var(--npw-canvas)] overflow-hidden">{p.photo_url && <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover"/>}</div></div>
                    <div className="col-span-8 md:col-span-5">
                      <span className={p.status==='lost'?'npw-badge-lost':'npw-badge-registered'}>{p.status}</span>
                      <h3 className="font-extrabold text-3xl text-[var(--npw-text)] mt-2 leading-tight">{p.name}</h3>
                      <p className="text-[var(--npw-muted)] mt-1">{p.breed || p.species}</p>
                      {p.microchip && <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--npw-muted)] mt-3">Chip · {p.microchip}</p>}
                    </div>
                    <div className="col-span-12 md:col-span-3 flex flex-col gap-y-2 text-sm">
                      <Link to={`/p/${p.id}`} className="npw-link">View profile →</Link>
                      <a href={`${API}/pets/${p.id}/qr`} target="_blank" rel="noreferrer" className="npw-link">QR record →</a>
                      {p.status !== 'lost' && <Link to="/report-lost" className="npw-link">Report lost →</Link>}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </div>
    </div>
  );
}
