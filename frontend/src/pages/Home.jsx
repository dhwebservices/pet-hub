import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

const HERO = "https://images.unsplash.com/photo-1557495235-340eb888a9fb?crop=entropy&cs=srgb&fm=jpg&w=1800&q=85";
const STORY_IMG = "https://images.pexels.com/photos/3726679/pexels-photo-3726679.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";
const VET_IMG = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";

export default function Home() {
  const [count, setCount] = useState(null);
  useEffect(() => { api.get("/lost").then(r => setCount(r.data.length)).catch(() => setCount(0)); }, []);

  return (
    <div data-testid="home-page">

      {/* HERO */}
      <section className="relative">
        <div className="relative h-[680px] md:h-[780px] overflow-hidden">
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1f19]/90 via-[#0e1f19]/55 to-transparent"/>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-20 md:pb-28">
            <div className="max-w-3xl text-white">
              <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-white/70 mb-8 flex items-center gap-3"><span className="w-8 h-px bg-white/40"/> Global Pet Registry · Est. 2026</div>
              <h1 className="font-display font-extrabold tracking-tight text-5xl md:text-7xl leading-[0.95]">The modern pet&nbsp;registry &amp; recovery network.</h1>
              <p className="mt-8 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">Register your pet once. If they ever go missing, every nearby member, veterinarian and rescue in the network is alerted within minutes.</p>
              <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm font-semibold">
                <Link to="/register" data-testid="hero-register-cta" className="inline-flex items-center gap-2 text-white border-b border-white pb-1 hover:opacity-80">Register your pet <ArrowRight className="w-4 h-4"/></Link>
                <Link to="/report-lost" data-testid="hero-report-lost-cta" className="inline-flex items-center gap-2 text-white/80 border-b border-white/30 pb-1 hover:text-white hover:border-white">Report a lost pet <ArrowUpRight className="w-4 h-4"/></Link>
              </div>
            </div>
          </div>
        </div>
        {/* Live activity band */}
        <div className="bg-[#0e1f19] text-white/85 text-[13px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-x-8 gap-y-2 font-medium">
            <span className="flex items-center gap-2"><span className="relative flex w-2 h-2"><span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-[var(--gpr-alert)] opacity-70"/><span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--gpr-alert)]"/></span><span className="text-white">{count === null ? "—" : count} active alert{count === 1 ? "" : "s"}</span></span>
            <span className="hidden sm:inline text-white/35">·</span>
            <span>Radius dispatch in under 5 minutes</span>
            <span className="hidden md:inline text-white/35">·</span>
            <span>Free for owners · £2.99 Premium · Donor-supported</span>
          </div>
        </div>
      </section>

      {/* EDITORIAL — single quiet statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 grid md:grid-cols-12 gap-12 items-start">
        <figure className="md:col-span-6">
          <div className="rounded-md overflow-hidden">
            <img src={STORY_IMG} alt="" className="w-full h-[520px] object-cover"/>
          </div>
          <figcaption className="text-xs text-[var(--gpr-muted)] mt-3 italic">A lost dog reunited within 90 minutes of her owner filing a report — the kind of outcome the network is built to make ordinary.</figcaption>
        </figure>
        <div className="md:col-span-5 md:col-start-8 md:pt-6">
          <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)]">A note from the registry</div>
          <p className="mt-6 font-display text-[28px] md:text-[34px] text-[var(--gpr-primary)] leading-[1.2] font-semibold">Microchips are not a recovery system. They are a record system.</p>
          <p className="mt-7 text-[17px] text-[var(--gpr-text)] leading-[1.7]">A chip only matters when a stranger finds your pet, takes it to a vet, scans the chip, and a clerk calls the right phone number on file. By then, sometimes days have passed.</p>
          <p className="mt-4 text-[17px] text-[var(--gpr-text)] leading-[1.7]">Global Pet Registry adds the layer that's missing: a real-time, postcode-based alert network. The moment a pet is reported missing, every registered member within ten miles is emailed.</p>
          <Link to="/about" className="mt-10 gpr-link">Read how it works <ArrowUpRight className="w-4 h-4"/></Link>
        </div>
      </section>

      {/* PULL QUOTE */}
      <section className="border-y border-[var(--gpr-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28">
          <span className="font-display font-extrabold text-7xl md:text-8xl text-[var(--gpr-alert)] leading-none block">&ldquo;</span>
          <blockquote className="font-display font-semibold text-[var(--gpr-primary)] text-3xl md:text-[40px] leading-[1.25] -mt-6">
            Recovery is a community event, not a database query. The faster you can put a photograph in front of the right person on the right street, the better the outcome — every time.
          </blockquote>
          <footer className="mt-10 text-sm text-[var(--gpr-muted)] flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[var(--gpr-text)]">Dr. Helen Maris</span>
            <span className="text-[var(--gpr-border)]">·</span>
            <span>Veterinary surgeon, MRCVS</span>
          </footer>
        </div>
      </section>

      {/* PROFESSIONALS */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-32 grid md:grid-cols-12 gap-14 items-center">
          <figure className="md:col-span-5">
            <img src={VET_IMG} alt="" className="w-full h-[520px] object-cover rounded-md"/>
          </figure>
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)]">For veterinarians &amp; rescues</div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[var(--gpr-primary)] mt-4 leading-[1.05] max-w-xl">Built with the professionals who already do the work.</h2>
            <p className="mt-7 text-[17px] text-[var(--gpr-muted)] leading-[1.7] max-w-xl">Verified veterinary practices and rescue organisations can submit found reports, scan microchip records and confirm reunifications directly through their portal. Every action is timestamped and audit-logged.</p>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm">
              <Link to="/vet-register" className="gpr-link">Veterinary registration <ArrowUpRight className="w-4 h-4"/></Link>
              <Link to="/rescue-register" className="gpr-link">Rescue registration <ArrowUpRight className="w-4 h-4"/></Link>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM */}
      <section className="bg-[var(--gpr-primary)] text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full bg-white/5 pointer-events-none"/>
        <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-[var(--gpr-alert)]/15 pointer-events-none"/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-14">
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-white/60">Membership</div>
            <div className="mt-7 flex items-baseline gap-4">
              <span className="font-display font-extrabold text-7xl md:text-[120px] leading-none tracking-tight">£2.99</span>
              <span className="text-white/60 text-xl font-medium">/ month</span>
            </div>
            <p className="text-white/80 mt-9 max-w-xl text-[17px] leading-[1.7]">Family account access, a medical record vault, priority alerts within twenty-five miles and extended document storage. Your subscription keeps the alert network free for owners who can't afford to pay.</p>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-3 text-sm font-semibold">
              <Link to="/subscribe" data-testid="cta-subscribe" className="inline-flex items-center gap-2 text-white border-b border-white pb-1 hover:opacity-80">Upgrade <ArrowRight className="w-4 h-4"/></Link>
              <Link to="/donate" data-testid="cta-donate" className="inline-flex items-center gap-2 text-white/80 border-b border-white/30 hover:text-white hover:border-white pb-1">Donate instead <ArrowUpRight className="w-4 h-4"/></Link>
            </div>
          </div>
          <ul className="md:col-span-5 space-y-5 text-[15px] md:pt-12">
            {[
              "Multiple emergency contacts per pet",
              "Medical record vault with documents",
              "Family / multi-user account access",
              "Priority alerts within 25 mi radius",
              "Extended document storage",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-4 border-b border-white/10 pb-5 last:border-b-0"><span className="text-[var(--gpr-alert)] font-mono text-xs pt-1.5 tracking-wider">{String(i+1).padStart(2,'0')}</span>{f}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
