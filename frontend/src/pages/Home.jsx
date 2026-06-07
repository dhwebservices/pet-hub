import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

const HERO = "https://images.unsplash.com/photo-1557495235-340eb888a9fb?crop=entropy&cs=srgb&fm=jpg&w=1800&q=85";
const STORY_IMG = "https://images.pexels.com/photos/3726679/pexels-photo-3726679.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";
const REG_IMG = "https://images.unsplash.com/photo-1559858781-3b3e5cad4487?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85";
const ALERT_IMG = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85";
const REUNION_IMG = "https://images.pexels.com/photos/16019884/pexels-photo-16019884.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";
const VET_IMG = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";

export default function Home() {
  const [count, setCount] = useState(null);
  useEffect(() => { api.get("/lost").then(r => setCount(r.data.length)).catch(() => setCount(0)); }, []);

  return (
    <div data-testid="home-page">

      {/* HERO */}
      <section className="relative">
        <div className="relative h-[680px] md:h-[760px] overflow-hidden">
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1f19]/90 via-[#0e1f19]/55 to-transparent"/>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-16 md:pb-24">
            <div className="max-w-3xl text-white">
              <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-white/70 mb-8 flex items-center gap-3"><span className="w-8 h-px bg-white/40"/> Global Pet Registry · Est. 2026</div>
              <h1 className="font-display font-extrabold tracking-tight text-5xl md:text-7xl leading-[0.95]">The modern pet&nbsp;registry &amp; recovery network.</h1>
              <p className="mt-8 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">Register your pet once. If they ever go missing, every nearby member, veterinarian and rescue in the network is alerted within minutes.</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                <Link to="/register" data-testid="hero-register-cta" className="inline-flex items-center gap-2 bg-white text-[var(--gpr-primary)] px-6 py-3 rounded-full font-semibold hover:bg-white/90">Register your pet <ArrowRight className="w-4 h-4"/></Link>
                <Link to="/report-lost" data-testid="hero-report-lost-cta" className="inline-flex items-center gap-2 text-white border-b border-white/40 pb-1 hover:border-white">Report a lost pet <ArrowUpRight className="w-4 h-4"/></Link>
              </div>
            </div>
          </div>
        </div>
        {/* Live activity band — replaces stats strip */}
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

      {/* EDITORIAL STORY — magazine intro, not headline+grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-12 items-start">
        <figure className="md:col-span-6">
          <div className="rounded-md overflow-hidden">
            <img src={STORY_IMG} alt="" className="w-full h-[520px] object-cover"/>
          </div>
          <figcaption className="text-xs text-[var(--gpr-muted)] mt-3 italic">A lost dog reunited within 90 minutes of her owner filing a report — the kind of outcome the network is built to make ordinary.</figcaption>
        </figure>
        <div className="md:col-span-5 md:col-start-8 md:pt-6">
          <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)]">A note from the registry</div>
          <p className="mt-6 text-2xl md:text-[28px] font-display text-[var(--gpr-primary)] leading-[1.25]">Microchips are not a recovery system. They are a record system.</p>
          <p className="mt-6 text-[17px] text-[var(--gpr-text)] leading-[1.7]">A chip only matters when a stranger finds your pet, takes it to a vet, scans the chip, and a clerk calls the right phone number on file. By then, sometimes days have passed.</p>
          <p className="mt-4 text-[17px] text-[var(--gpr-text)] leading-[1.7]">Global Pet Registry adds the layer that's missing: a real-time, postcode-based alert network. The moment a pet is reported missing, every registered member within ten miles is emailed — with the photo, the area, and a one-tap link to drop a sighting.</p>
          <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-[var(--gpr-primary)] font-semibold border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">Read how it works <ArrowUpRight className="w-4 h-4"/></Link>
        </div>
      </section>

      {/* PULL QUOTE — single editorial moment */}
      <section className="bg-[var(--gpr-secondary)]/40 border-y border-[var(--gpr-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28">
          <span className="font-display font-extrabold text-7xl md:text-8xl text-[var(--gpr-alert)] leading-none block">&ldquo;</span>
          <blockquote className="font-display font-bold text-[var(--gpr-primary)] text-3xl md:text-[40px] leading-[1.25] -mt-6">
            Recovery is a community event, not a database query. The faster you can put a photograph in front of the right person on the right street, the better the outcome — every time.
          </blockquote>
          <footer className="mt-8 text-sm text-[var(--gpr-muted)] flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[var(--gpr-text)]">Dr. Helen Maris</span>
            <span className="text-[var(--gpr-border)]">·</span>
            <span>Veterinary surgeon, MRCVS</span>
          </footer>
        </div>
      </section>

      {/* THREE ROWS — alternating, no numbered labels, magazine layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-32">

        {/* Row 1 — image left, copy right */}
        <article className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <img src={REG_IMG} alt="" className="w-full h-[420px] md:h-[520px] object-cover rounded-md"/>
          </div>
          <div className="md:col-span-5">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-alert)]">i &nbsp;·&nbsp; Register</div>
            <h3 className="font-display font-extrabold text-3xl md:text-[40px] text-[var(--gpr-primary)] mt-5 leading-[1.1]">A record that travels with your pet, not your filing cabinet.</h3>
            <p className="mt-5 text-[17px] text-[var(--gpr-muted)] leading-[1.7]">Photo, microchip, medical alerts, emergency contact. We geocode your postcode privately so the network knows where to look — your address is never shown publicly. Every pet gets a tamper-proof QR profile you can print on a collar tag.</p>
          </div>
        </article>

        {/* Row 2 — copy left, image right */}
        <article className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 md:order-1">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-alert)]">ii &nbsp;·&nbsp; Alert</div>
            <h3 className="font-display font-extrabold text-3xl md:text-[40px] text-[var(--gpr-primary)] mt-5 leading-[1.1]">When minutes matter, ten miles of neighbours hear about it.</h3>
            <p className="mt-5 text-[17px] text-[var(--gpr-muted)] leading-[1.7]">File a lost report and the platform dispatches an email — with photograph, breed, last-seen area and a single tap to report a sighting — to every member registered within a ten-mile radius. Architecture is ready for SMS the day Twilio is wired in.</p>
          </div>
          <div className="md:col-span-7 md:order-2">
            <img src={ALERT_IMG} alt="" className="w-full h-[420px] md:h-[520px] object-cover rounded-md"/>
          </div>
        </article>

        {/* Row 3 — image left, copy right */}
        <article className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <img src={REUNION_IMG} alt="" className="w-full h-[420px] md:h-[520px] object-cover rounded-md"/>
          </div>
          <div className="md:col-span-5">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-alert)]">iii &nbsp;·&nbsp; Reunite</div>
            <h3 className="font-display font-extrabold text-3xl md:text-[40px] text-[var(--gpr-primary)] mt-5 leading-[1.1]">Sightings come back. Owners get notified. Cases close.</h3>
            <p className="mt-5 text-[17px] text-[var(--gpr-muted)] leading-[1.7]">Anyone — neighbour, dog walker, postman — can drop a sighting with a pin and a photo. The owner is emailed instantly. When the pet is home, mark the case found. Reunification is logged for the community and removed from the public map.</p>
          </div>
        </article>
      </section>

      {/* PROFESSIONALS — vertical image, copy beside */}
      <section className="bg-white border-t border-[var(--gpr-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28 grid md:grid-cols-12 gap-12 items-center">
          <figure className="md:col-span-5">
            <img src={VET_IMG} alt="" className="w-full h-[480px] object-cover rounded-md"/>
          </figure>
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-[var(--gpr-muted)]">For veterinarians &amp; rescues</div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[var(--gpr-primary)] mt-4 leading-[1.05] max-w-xl">Built with the professionals who already do the work.</h2>
            <p className="mt-6 text-[17px] text-[var(--gpr-muted)] leading-[1.7] max-w-xl">Verified veterinary practices and rescue organisations can submit found reports, scan microchip records and confirm reunifications directly through their portal. Every action is timestamped and audit-logged.</p>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
              <Link to="/vet-register" className="inline-flex items-center gap-1 text-[var(--gpr-primary)] border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">Veterinary registration <ArrowUpRight className="w-4 h-4"/></Link>
              <Link to="/rescue-register" className="inline-flex items-center gap-1 text-[var(--gpr-primary)] border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">Rescue registration <ArrowUpRight className="w-4 h-4"/></Link>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM — magazine subscription style */}
      <section className="bg-[var(--gpr-primary)] text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full bg-white/5 pointer-events-none"/>
        <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-[var(--gpr-alert)]/15 pointer-events-none"/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.28em] uppercase font-semibold text-white/60">Membership</div>
            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display font-extrabold text-7xl md:text-[112px] leading-none tracking-tight">£2.99</span>
              <span className="text-white/60 text-xl font-medium">/ month</span>
            </div>
            <p className="text-white/80 mt-8 max-w-xl text-[17px] leading-[1.7]">Family account access, a medical record vault, priority alerts within twenty-five miles and extended document storage. Your subscription keeps the alert network free for owners who can't afford to pay.</p>
          </div>
          <ul className="md:col-span-5 space-y-4 text-[15px] md:pt-8">
            {[
              "Multiple emergency contacts per pet",
              "Medical record vault with documents",
              "Family / multi-user account access",
              "Priority alerts within 25 mi radius",
              "Extended document storage",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3 border-b border-white/10 pb-4"><span className="text-[var(--gpr-alert)] font-display font-bold text-sm pt-0.5">+</span>{f}</li>
            ))}
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/subscribe" data-testid="cta-subscribe" className="bg-white text-[var(--gpr-primary)] rounded-full px-6 py-3 font-semibold inline-flex items-center gap-2">Upgrade <ArrowRight className="w-4 h-4"/></Link>
              <Link to="/donate" data-testid="cta-donate" className="inline-flex items-center gap-1 text-white border-b border-white/40 hover:border-white pb-0.5">Donate instead <ArrowUpRight className="w-4 h-4"/></Link>
            </div>
          </ul>
        </div>
      </section>

      {/* CLOSING */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28 text-center">
        <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[var(--gpr-primary)] leading-tight">Two minutes today. <br className="hidden md:block"/>A search party already waiting if you ever need one.</h2>
        <Link to="/register" className="mt-10 inline-flex items-center gap-2 bg-[var(--gpr-primary)] text-white rounded-full px-8 py-3.5 font-semibold hover:bg-[var(--gpr-primary-hover)]">Register your pet <ArrowRight className="w-4 h-4"/></Link>
      </section>
    </div>
  );
}
