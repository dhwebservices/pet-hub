import React, { useState } from "react";
import { api } from "../lib/api";
import { fmtErr } from "../lib/auth";
import { ArrowRight, ArrowUpRight, Mail, MessagesSquare, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const TOPICS = [
  "Account & registration",
  "Reporting a lost or found pet",
  "Subscription & billing",
  "Veterinary / rescue verification",
  "Press & partnerships",
  "Something else",
];

export default function Support() {
  const [f, setF] = useState({ name:"", email:"", subject:"", message:"" });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(s => ({...s, [k]: v}));

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await api.post("/support", { ...f, subject: `[${topic}] ${f.subject}` }); setSent(true); }
    catch(e){ setErr(fmtErr(e.response?.data?.detail)); } finally { setLoading(false); }
  };

  return (
    <div data-testid="support-page">
      {/* Header band */}
      <section className="border-b border-[var(--gpr-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)]">Support · written by humans, answered by humans</div>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl text-[var(--gpr-primary)] mt-6 leading-[1.02]">We answer every message <span className="text-[var(--gpr-alert)]">— usually within a day.</span></h1>
            <p className="text-[17px] text-[var(--gpr-muted)] leading-[1.7] mt-8 max-w-xl">If your pet is missing right now, please file a lost report first — that triggers the radius alert network immediately. For everything else, write below and a real person will reply.</p>
          </div>
          <aside className="md:col-span-4 md:col-start-9 md:pt-3">
            <Link to="/report-lost" className="block group">
              <div className="flex items-start gap-3 border-l-2 border-[var(--gpr-alert)] pl-5 py-2">
                <AlertTriangle className="w-5 h-5 text-[var(--gpr-alert)] mt-0.5 flex-shrink-0"/>
                <div>
                  <div className="font-display font-bold text-[var(--gpr-primary)]">Urgent: my pet is missing</div>
                  <p className="text-sm text-[var(--gpr-muted)] mt-1 leading-relaxed">Skip support — go straight to the lost-pet report. Alerts dispatch in under five minutes.</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--gpr-alert)] border-b border-[var(--gpr-alert)]/40 group-hover:border-[var(--gpr-alert)] pb-0.5">File a lost report <ArrowRight className="w-4 h-4"/></span>
                </div>
              </div>
            </Link>
          </aside>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-16 gap-y-12">
        {/* Left rail: contact channels, faq-style */}
        <aside className="md:col-span-4 space-y-10 md:pt-2">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)] mb-4">Direct channels</div>
            <a href="mailto:hello@globalpetregistry.com" className="flex items-start gap-4 py-3 border-t border-[var(--gpr-border)] hover:opacity-80">
              <Mail className="w-5 h-5 text-[var(--gpr-primary)] mt-0.5"/>
              <div>
                <div className="font-display font-semibold text-[var(--gpr-primary)]">hello@globalpetregistry.com</div>
                <div className="text-sm text-[var(--gpr-muted)] mt-0.5">General &amp; account enquiries</div>
              </div>
            </a>
            <a href="mailto:press@globalpetregistry.com" className="flex items-start gap-4 py-3 border-t border-[var(--gpr-border)] hover:opacity-80">
              <MessagesSquare className="w-5 h-5 text-[var(--gpr-primary)] mt-0.5"/>
              <div>
                <div className="font-display font-semibold text-[var(--gpr-primary)]">press@globalpetregistry.com</div>
                <div className="text-sm text-[var(--gpr-muted)] mt-0.5">Media &amp; partnerships</div>
              </div>
            </a>
          </div>

          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)] mb-4">Useful answers</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)] inline-flex items-center gap-1.5">How the alert network works <ArrowUpRight className="w-3.5 h-3.5"/></Link></li>
              <li><Link to="/subscribe" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)] inline-flex items-center gap-1.5">What's included in Premium <ArrowUpRight className="w-3.5 h-3.5"/></Link></li>
              <li><Link to="/privacy" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)] inline-flex items-center gap-1.5">How your data is handled <ArrowUpRight className="w-3.5 h-3.5"/></Link></li>
              <li><Link to="/vet-register" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)] inline-flex items-center gap-1.5">Verifying a veterinary practice <ArrowUpRight className="w-3.5 h-3.5"/></Link></li>
            </ul>
          </div>

          <div className="text-[13px] text-[var(--gpr-muted)] leading-relaxed italic">
            Office hours: Mon–Fri, 09:00–18:00 GMT. Urgent reunification cases are monitored at weekends.
          </div>
        </aside>

        {/* Right: editorial inquiry form */}
        <div className="md:col-span-7 md:col-start-6">
          {sent ? (
            <div className="border-l-2 border-[var(--gpr-success)] pl-6 py-2" data-testid="support-sent">
              <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-success)]">Message received</div>
              <h2 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-4">Thank you — we'll be in touch shortly.</h2>
              <p className="text-[var(--gpr-muted)] mt-3 leading-relaxed max-w-md">Your message has reached the registry team. We aim to reply within one working day. For active recovery cases, please also file a lost-pet report.</p>
              <button onClick={() => { setSent(false); setF({name:"",email:"",subject:"",message:""}); }} className="gpr-link mt-6 cursor-pointer">Send another message <ArrowRight className="w-4 h-4"/></button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-10">
              <div>
                <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)] mb-5">What's this about?</div>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map(t => (
                    <button type="button" key={t} onClick={()=>setTopic(t)} data-testid={`topic-${t}`} className={`text-sm px-4 py-2 rounded-sm border transition-colors ${topic===t ? 'bg-[var(--gpr-primary)] text-white border-[var(--gpr-primary)]' : 'bg-transparent border-[var(--gpr-border)] text-[var(--gpr-text)] hover:border-[var(--gpr-primary)]'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <label className="gpr-label">Your name</label>
                  <input required data-testid="support-name" className="gpr-input" value={f.name} onChange={e=>set('name', e.target.value)}/>
                </div>
                <div>
                  <label className="gpr-label">Email</label>
                  <input required type="email" data-testid="support-email" className="gpr-input" value={f.email} onChange={e=>set('email', e.target.value)}/>
                </div>
              </div>

              <div>
                <label className="gpr-label">Subject</label>
                <input required data-testid="support-subject" className="gpr-input" value={f.subject} onChange={e=>set('subject', e.target.value)}/>
              </div>

              <div>
                <label className="gpr-label">Tell us what's going on</label>
                <textarea required data-testid="support-message" className="gpr-input min-h-[140px] resize-y" rows={6} value={f.message} onChange={e=>set('message', e.target.value)}/>
              </div>

              {err && <div className="text-sm text-[var(--gpr-alert)]">{err}</div>}

              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[var(--gpr-border)]">
                <span className="text-xs text-[var(--gpr-muted)]">By submitting you agree to our <Link to="/privacy" className="underline">privacy policy</Link>.</span>
                <button data-testid="support-submit" disabled={loading} className="gpr-btn-primary">{loading ? "Sending…" : "Send message"} <ArrowRight className="w-4 h-4"/></button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
