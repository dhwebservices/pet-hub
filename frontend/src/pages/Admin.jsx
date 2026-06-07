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

  if (loading) return <div className="p-12 text-center">Loading…</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login"/>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="admin-page">
      <div className="gpr-eyebrow">Administration</div>
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-1">Platform overview</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t} data-testid={`admin-tab-${t}`} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium border ${tab===t?'bg-[var(--gpr-primary)] text-white border-[var(--gpr-primary)]':'border-[var(--gpr-border)] text-[var(--gpr-text)] bg-white'}`}>{t}</button>
        ))}
      </div>
      <div className="mt-8 overflow-x-auto border-t border-[var(--gpr-border)] pt-6">
        {data === null ? <div className="text-[var(--gpr-muted)]">Loading…</div> : (
          tab === "stats" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(data).map(([k,v]) => (
                <div key={k} className="border border-[var(--gpr-border)] rounded-md p-4">
                  <div className="gpr-eyebrow">{k.replace(/_/g," ")}</div>
                  <div className="font-display font-bold text-3xl text-[var(--gpr-primary)] mt-1">{v}</div>
                </div>
              ))}
            </div>
          ) : Array.isArray(data) && data.length === 0 ? <div className="text-[var(--gpr-muted)]">No records.</div> : (
            <table className="w-full text-sm" data-testid={`admin-table-${tab}`}>
              <thead><tr className="text-left text-[var(--gpr-muted)] uppercase text-xs tracking-wide">
                {Object.keys(data[0]).slice(0,6).map(k => <th key={k} className="py-2 pr-4">{k}</th>)}
              </tr></thead>
              <tbody>
                {data.map((row,i)=>(
                  <tr key={i} className="border-t border-[var(--gpr-border)]">
                    {Object.keys(data[0]).slice(0,6).map(k => (
                      <td key={k} className="py-2 pr-4 align-top">{typeof row[k] === 'object' ? JSON.stringify(row[k]).slice(0,80) : String(row[k] ?? '').slice(0,100)}</td>
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
