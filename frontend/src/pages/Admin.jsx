import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const tabs = ["stats","users","pets","vets","rescues","support","subscriptions","donations","email-log"];

export default function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("stats");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setData(null);
    api.get(`/admin/${tab}`).then(r=>setData(r.data));
  }, [tab, user]);

  if (loading) return <div className="py-24 text-center font-serif italic text-[var(--gpr-muted)]">Loading…</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login"/>;

  return (
    <div data-testid="admin-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <header className="grid md:grid-cols-12 gap-x-14 items-end mb-12">
        <div className="md:col-span-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-5">Administration · Restricted</div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] leading-[1]">The <em className="accent text-[var(--gpr-alert)]">registry</em>, in numbers.</h1>
        </div>
      </header>
      <div className="border-y border-[var(--gpr-border)]">
        <div className="flex flex-wrap gap-x-6 gap-y-2 py-4">
          {tabs.map(t => (
            <button key={t} data-testid={`admin-tab-${t}`} onClick={()=>setTab(t)} className={`relative text-sm font-semibold pb-1 transition-colors ${tab===t?'text-[var(--gpr-primary)] after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-px after:bg-[var(--gpr-primary)]':'text-[var(--gpr-muted)] hover:text-[var(--gpr-text)]'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="mt-12 overflow-x-auto">
        {data === null ? <div className="font-serif italic text-[var(--gpr-muted)]">Loading…</div> : (
          tab === "stats" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-10">
              {Object.entries(data).map(([k,v]) => (
                <div key={k} className="border-t border-[var(--gpr-border)] pt-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)]">{k.replace(/_/g," ")}</div>
                  <div className="font-display font-extrabold text-5xl text-[var(--gpr-primary)] mt-3">{v}</div>
                </div>
              ))}
            </div>
          ) : Array.isArray(data) && data.length === 0 ? <div className="font-serif italic text-[var(--gpr-muted)]">No records.</div> : (
            <table className="w-full text-sm" data-testid={`admin-table-${tab}`}>
              <thead><tr className="text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] border-b border-[var(--gpr-border)]">
                {Object.keys(data[0]).slice(0,6).map(k => <th key={k} className="py-3 pr-6 font-medium">{k}</th>)}
              </tr></thead>
              <tbody>
                {data.map((row,i)=>(
                  <tr key={i} className="border-b border-[var(--gpr-border)]">
                    {Object.keys(data[0]).slice(0,6).map(k => (
                      <td key={k} className="py-3 pr-6 align-top">{typeof row[k] === 'object' ? JSON.stringify(row[k]).slice(0,80) : String(row[k] ?? '—').slice(0,100)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
