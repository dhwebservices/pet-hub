import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Plus, QrCode, AlertTriangle, CheckCircle2, Crown } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/pets/mine").then(r=>{setPets(r.data); setLoading(false);}); }, []);

  if (!user) return <div className="p-12 text-center">Please sign in.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="dashboard-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="gpr-eyebrow">Owner dashboard</div>
          <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-1">Welcome, {user.first_name}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/subscribe" data-testid="dashboard-subscribe" className="gpr-btn-secondary flex items-center gap-2"><Crown className="w-4 h-4"/>{user.subscription_tier==='premium'?'Manage Premium':'Upgrade to Premium'}</Link>
          <Link to="/register-pet" data-testid="dashboard-add-pet" className="gpr-btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/>Add pet</Link>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-12 gap-10 border-t border-[var(--gpr-border)] pt-10">
        <aside className="lg:col-span-3 h-fit">
          <div className="gpr-eyebrow mb-3">Account</div>
          <div className="text-sm"><div className="font-semibold">{user.first_name} {user.last_name}</div><div className="text-[var(--gpr-muted)]">{user.email}</div></div>
          <div className="border-t border-[var(--gpr-border)] my-5"/>
          <div className="gpr-eyebrow mb-3">Plan</div>
          <div className="flex items-center gap-2 text-sm">
            {user.subscription_tier==='premium' ? <><CheckCircle2 className="w-4 h-4 text-[var(--gpr-success)]"/> Premium</> : <>Free tier</>}
          </div>
        </aside>

        <section className="lg:col-span-9">
          <h2 className="font-display font-bold text-xl mb-6 text-[var(--gpr-primary)]">Your pets</h2>
          {loading ? <div className="text-[var(--gpr-muted)]">Loading…</div> :
            pets.length === 0 ? (
              <div className="text-center py-16" data-testid="dashboard-empty">
                <p className="text-[var(--gpr-muted)]">You have no pets registered yet.</p>
                <Link to="/register-pet" className="gpr-btn-primary mt-6 inline-block">Register your first pet</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {pets.map(p => (
                  <div key={p.id} data-testid={`my-pet-${p.id}`} className="flex flex-col">
                    <div className="aspect-[4/3] bg-[var(--gpr-secondary)] rounded-md overflow-hidden">{p.photo_url && <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover"/>}</div>
                    <div className="pt-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-3"><div className="font-display font-bold text-[var(--gpr-primary)]">{p.name}</div>
                        <span className={p.status==='lost'?'gpr-badge-lost':'gpr-badge-registered'}>{p.status}</span></div>
                      <div className="text-sm text-[var(--gpr-muted)]">{p.breed || p.species}</div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <Link to={`/p/${p.id}`} className="gpr-btn-secondary text-xs py-1.5 px-3">View profile</Link>
                        <a href={`${API}/pets/${p.id}/qr`} target="_blank" rel="noreferrer" className="gpr-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><QrCode className="w-3 h-3"/> QR</a>
                        {p.status !== 'lost' && <Link to="/report-lost" className="gpr-btn-alert text-xs py-1.5 px-3 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Report lost</Link>}
                      </div>
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
