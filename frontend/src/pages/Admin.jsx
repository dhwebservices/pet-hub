import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { fmtErr, useAuth } from "../lib/auth";

const tabs = ["stats","users","pets","vets","rescues","support","donations","email-log"];

export default function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("stats");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user || user.role !== 'administrator') return;
    setData(null);
    setErr("");
    api.get(`/admin/${tab}`)
      .then(r=>setData(r.data))
      .catch(e=>{
        setData([]);
        setErr(fmtErr(e.response?.data?.detail) || e.message);
      });
  }, [tab, user]);

  if (loading) return <div className="py-24 text-center text-[var(--npw-muted)]">Loading…</div>;
  if (!user || user.role !== 'administrator') return <Navigate to="/login"/>;
  const rows = Array.isArray(data) ? data : [];
  const stats = data && !Array.isArray(data) && typeof data === "object" ? data : {};
  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 6) : [];

  return (
    <div data-testid="admin-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <header className="grid md:grid-cols-12 gap-x-14 items-end mb-12">
        <div className="md:col-span-8">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-5">Administration · Restricted</div>
          <h1 className="font-extrabold text-5xl md:text-6xl text-[var(--npw-text)] leading-[1]">The <span className="text-[var(--npw-accent)]">registry</span>, in numbers.</h1>
        </div>
      </header>
      <div className="border-y border-[var(--npw-border)]">
        <div className="flex flex-wrap gap-x-6 gap-y-2 py-4">
          {tabs.map(t => (
            <button key={t} data-testid={`admin-tab-${t}`} onClick={()=>setTab(t)} className={`relative text-sm font-semibold pb-1 transition-colors ${tab===t?'text-[var(--npw-text)] after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-px after:bg-[var(--npw-text)]':'text-[var(--npw-muted)] hover:text-[var(--npw-text)]'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="mt-12 overflow-x-auto">
        {err ? (
          <div className="npw-notice-warn" data-testid="admin-error">
            <div className="font-bold text-[var(--npw-text)]">Could not load {tab.replace(/-/g, " ")}.</div>
            <p className="text-sm text-[var(--npw-muted)] mt-1">{err}</p>
          </div>
        ) : data === null ? <div className="text-[var(--npw-muted)]">Loading…</div> : (
          tab === "stats" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-10">
              {Object.entries(stats).map(([k,v]) => (
                <div key={k} className="border-t border-[var(--npw-border)] pt-4">
                  <div className="npw-eyebrow text-[var(--npw-muted)]">{k.replace(/_/g," ")}</div>
                  <div className="font-extrabold text-5xl text-[var(--npw-text)] mt-3">{v}</div>
                </div>
              ))}
              {Object.keys(stats).length === 0 && <div className="text-[var(--npw-muted)]">No statistics available.</div>}
            </div>
          ) : rows.length === 0 ? <div className="text-[var(--npw-muted)]">No records.</div> : (
            <table className="w-full text-sm" data-testid={`admin-table-${tab}`}>
              <thead><tr className="text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--npw-muted)] border-b border-[var(--npw-border)]">
                {columns.map(k => <th key={k} className="py-3 pr-6 font-medium">{k}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((row,i)=>(
                  <tr key={i} className="border-b border-[var(--npw-border)]">
                    {columns.map(k => (
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
