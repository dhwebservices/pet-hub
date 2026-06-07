import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const HERO = "https://images.unsplash.com/photo-1557495235-340eb888a9fb?crop=entropy&cs=srgb&fm=jpg&w=2000&q=85";
const STORY_IMG = "https://images.pexels.com/photos/3726679/pexels-photo-3726679.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";
const VET_IMG = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200";

export default function Home() {
  const [count, setCount] = useState(null);
  useEffect(() => { api.get("/lost").then(r => setCount(r.data.length)).catch(() => setCount(0)); }, []);

  return (
    <div data-testid="home-page">

      {/* HERO — cinematic, serif italic accent inside sans headline */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[620px] overflow-hidden">
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0e1f19]/85 via-[#0e1f19]/45 to-transparent"/>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-20 md:pb-28 text-white">
            <div className="text-[11px] tracking-[0.32em] uppercase font-medium text-white/70 mb-10 flex items-center gap-4">
              <span className="w-12 h-px bg-white/40"/>
              <span>Issue №&nbsp;01 &middot; Established 2026 &middot; United Kingdom</span>
            </div>
            <h1 className="font-display font-extrabold tracking-tight text-5xl md:text-[88px] leading-[0.92] max-w-5xl">
              The modern pet registry <em className="accent text-white/95">&amp;</em> recovery network.
            </h1>
            <div className="mt-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
              <p className="font-serif italic text-white/90 text-xl md:text-2xl max-w-xl leading-[1.45]">
                A search party already waiting, the day you ever need one.
              </p>
              <div className="flex items-center gap-x-10 text-sm font-semibold">
                <Link to="/register" data-testid="hero-register-cta" className="inline-flex items-center gap-2 text-white border-b border-white pb-1 hover:opacity-80">Register your pet →</Link>
                <Link to="/report-lost" data-testid="hero-report-lost-cta" className="inline-flex items-center gap-2 text-white/85 border-b border-white/35 pb-1 hover:text-white hover:border-white">Report a lost pet</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPENING PARAGRAPH — drop cap, serif accent words */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-40 pb-20 md:pb-28">
        <div className="grid md:grid-cols-12 gap-x-16 gap-y-10">
          <div className="md:col-span-7 md:col-start-2">
            <p className="dropcap text-[20px] md:text-[22px] leading-[1.65] text-[var(--gpr-text)]">
              <span>Most pets are recovered by neighbours, not by databases.</span> A microchip only matters when a stranger finds your pet, takes it to a vet, scans the chip, and a clerk calls the right phone number on file. By then — <em className="accent text-[var(--gpr-primary)]">sometimes days have passed</em>. Global Pet Registry adds the layer that's missing: a real-time, postcode-based alert network that puts a photograph in front of the right person, on the right street, in the right minute.
            </p>
            <p className="mt-10 text-[15px] text-[var(--gpr-muted)] tracking-wide">
              {count === null ? "—" : count} active alert{count === 1 ? "" : "s"}
              <span className="mx-3 text-[var(--gpr-border)]">/</span>
              dispatch in under five minutes
              <span className="mx-3 text-[var(--gpr-border)]">/</span>
              free for owners
            </p>
          </div>
          <aside className="md:col-span-3 md:col-start-10 md:pt-3">
            <div className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[var(--gpr-muted)] mb-3">Marginalia</div>
            <p className="font-serif italic text-[15px] text-[var(--gpr-muted)] leading-[1.6]">
              "The first hour is worth the next twenty-four. A photograph travelling at the speed of email beats a microchip travelling at the speed of foot."
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gpr-muted)] mt-4">— Field note, recovery volunteer</p>
          </aside>
        </div>
      </section>

      {/* PHOTOGRAPH — full bleed wide image with hanging italic caption */}
      <section>
        <figure>
          <div className="relative h-[58vh] min-h-[420px] overflow-hidden">
            <img src={STORY_IMG} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <figcaption className="font-serif italic text-[15px] text-[var(--gpr-muted)] max-w-2xl">
              <span className="not-italic font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mr-2 align-middle">Fig. 01</span>
              A lost dog reunited within ninety minutes of her owner filing a report. The kind of outcome the network is built to make ordinary.
            </figcaption>
          </div>
        </figure>
      </section>

      {/* PULL QUOTE — massive serif, no card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-44">
        <div className="md:max-w-5xl">
          <span className="font-serif text-[var(--gpr-alert)] text-[180px] md:text-[260px] leading-[0.7] block font-medium" aria-hidden="true">&ldquo;</span>
          <blockquote className="font-serif italic text-[var(--gpr-primary)] text-3xl md:text-[52px] leading-[1.15] -mt-12 md:-mt-20 hang-quote">
            Recovery is a community event, not a database query. The faster you can put a photograph in front of the right person on the right street, the better the outcome.
          </blockquote>
          <footer className="mt-10 flex items-baseline gap-x-4 text-sm">
            <span className="font-display font-bold text-[var(--gpr-primary)] tracking-tight">Dr. Helen Maris</span>
            <span className="font-serif italic text-[var(--gpr-muted)]">Veterinary surgeon, MRCVS</span>
          </footer>
        </div>
      </section>

      {/* PROFESSIONALS — image hangs off the side, copy with serif italic accent */}
      <section className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-x-16 gap-y-10 items-end">
            <figure className="md:col-span-6">
              <img src={VET_IMG} alt="" className="w-full h-[520px] md:h-[640px] object-cover"/>
              <figcaption className="font-serif italic text-[13px] text-[var(--gpr-muted)] mt-3"><span className="not-italic font-mono text-[10px] uppercase tracking-[0.2em] mr-2 align-middle">Fig. 02</span>Verified practices and rescues are the network's quiet backbone.</figcaption>
            </figure>
            <div className="md:col-span-5 md:col-start-8 md:pb-16">
              <h2 className="font-display font-extrabold text-4xl md:text-[56px] text-[var(--gpr-primary)] leading-[1.02]">
                Built with the <em className="accent text-[var(--gpr-alert)]">people</em> who already do the work.
              </h2>
              <p className="font-serif italic text-[var(--gpr-muted)] text-lg leading-[1.6] mt-8 max-w-md">
                Verified veterinary practices and rescue organisations submit found reports, scan microchip records and confirm reunifications directly through their portal. Every action is timestamped and audit-logged.
              </p>
              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm">
                <Link to="/vet-register" className="gpr-link">Veterinary registration →</Link>
                <Link to="/rescue-register" className="gpr-link">Rescue registration →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP — set as a magazine "subscribe to" advert, dark green ink on cream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="grid md:grid-cols-12 gap-x-16 gap-y-12">
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.32em] uppercase font-semibold text-[var(--gpr-muted)]">Membership</div>
            <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-3">If you'd like to support the network</p>
            <div className="mt-10 flex items-start gap-6 leading-none">
              <span className="font-serif text-[var(--gpr-primary)] font-medium text-[28px] md:text-4xl mt-4">£</span>
              <span className="font-display font-extrabold text-[var(--gpr-primary)] text-[140px] md:text-[220px] leading-[0.82] tracking-tight">2.99</span>
              <span className="font-serif italic text-[var(--gpr-muted)] mt-6 text-xl md:text-2xl">/ a month</span>
            </div>
            <p className="text-[var(--gpr-text)] text-[17px] leading-[1.7] mt-12 max-w-xl">
              Family account access, a medical record vault, priority alerts within twenty-five miles and extended document storage. Your subscription keeps the alert network free for owners who can't afford to pay.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-3 text-sm">
              <Link to="/subscribe" data-testid="cta-subscribe" className="gpr-link">Subscribe →</Link>
              <Link to="/donate" data-testid="cta-donate" className="gpr-link-alert">Donate instead</Link>
            </div>
          </div>
          <ul className="md:col-span-4 md:col-start-9 md:pt-4 font-serif text-[var(--gpr-text)]">
            {[
              "Multiple emergency contacts per pet",
              "Medical record vault with documents",
              "Family &middot; multi-user account access",
              "Priority alerts within 25 miles",
              "Extended document storage",
            ].map((f, i) => (
              <li key={i} className="flex gap-5 py-5 border-t border-[var(--gpr-border)] last:border-b last:border-b-[var(--gpr-border)]">
                <span className="font-mono text-xs text-[var(--gpr-muted)] tracking-wider pt-1">{String(i+1).padStart(2,'0')}</span>
                <span className="italic text-[17px] leading-snug" dangerouslySetInnerHTML={{__html: f}}/>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing colophon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-32">
        <div className="grid md:grid-cols-12 items-end gap-y-6">
          <div className="md:col-span-7 md:col-start-2">
            <h3 className="font-display font-extrabold text-4xl md:text-6xl text-[var(--gpr-primary)] leading-[1.02]">
              Two minutes today.<br/>
              <em className="accent text-[var(--gpr-alert)]">A network ready</em> for any day after.
            </h3>
          </div>
          <div className="md:col-span-3 md:col-start-10 text-right">
            <Link to="/register" className="gpr-link">Register a pet →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
