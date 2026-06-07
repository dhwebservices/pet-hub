import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1557495235-340eb888a9fb?crop=entropy&cs=srgb&fm=jpg&w=1800&q=85";
const PET1 = "https://images.unsplash.com/photo-1559858781-3b3e5cad4487?crop=entropy&cs=srgb&fm=jpg&w=900&q=85";
const VET = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900";

export default function Home() {
  return (
    <div data-testid="home-page">

      {/* HERO — full bleed image with overlay text, no card */}
      <section className="relative">
        <div className="relative h-[640px] md:h-[720px] overflow-hidden">
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1f19]/85 via-[#0e1f19]/50 to-transparent"/>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-14 md:pb-20">
            <div className="max-w-3xl text-white">
              <div className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white/70 mb-6">Global Pet Registry · Est. 2026</div>
              <h1 className="font-display font-extrabold tracking-tight text-5xl md:text-7xl leading-[0.95]">The modern pet&nbsp;registry &amp; recovery network.</h1>
              <p className="mt-8 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">Register your pet once. If they ever go missing, every nearby member, veterinarian and rescue in the network is alerted within minutes.</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                <Link to="/register" data-testid="hero-register-cta" className="inline-flex items-center gap-2 bg-white text-[var(--gpr-primary)] px-6 py-3 rounded-full font-semibold hover:bg-white/90">Register your pet <ArrowRight className="w-4 h-4"/></Link>
                <Link to="/report-lost" data-testid="hero-report-lost-cta" className="inline-flex items-center gap-2 text-white border-b border-white/40 pb-1 hover:border-white">Report a lost pet <ArrowUpRight className="w-4 h-4"/></Link>
              </div>
            </div>
          </div>
        </div>
        {/* Stats strip directly under hero, no boxes */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--gpr-border)]">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--gpr-border)]">
            {[
              { k: "Alert radius", v: "10 mi" },
              { k: "Dispatch time", v: "< 5 min" },
              { k: "Channels", v: "Email · QR" },
              { k: "Pricing", v: "Free · £2.99" },
            ].map((s, i) => (
              <div key={i} className={`py-8 ${i===0?'pr-6':'px-6'}`}>
                <dt className="gpr-eyebrow">{s.k}</dt>
                <dd className="font-display font-extrabold text-3xl md:text-4xl text-[var(--gpr-primary)] mt-2">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Editorial intro — two-column, no cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="gpr-eyebrow">Why it exists</div>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[var(--gpr-primary)] mt-3 leading-[1.05]">Most pets are recovered <span className="text-[var(--gpr-alert)]">by neighbours</span> — not by databases.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pt-3">
          <p className="text-lg leading-relaxed text-[var(--gpr-text)]">Microchip registries are necessary but slow. They depend on a stranger finding your pet, taking it to a vet, scanning it, and a clerk calling the right phone number on file.</p>
          <p className="text-lg leading-relaxed text-[var(--gpr-text)] mt-5">Global Pet Registry adds the missing layer: a real-time, postcode-based alert network. The moment a pet is reported missing, every registered member within ten miles is emailed — with the photo, the area, and a one-tap link to drop a sighting.</p>
        </div>
      </section>

      {/* Process — large numbered list, no boxes */}
      <section className="bg-white border-y border-[var(--gpr-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="gpr-eyebrow">How recovery works</div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[var(--gpr-primary)] mt-3 max-w-2xl">Four steps. One network. Every minute counts.</h2>
          <ol className="mt-14 space-y-12">
            {[
              { n: "01", t: "Register once", d: "Owner adds pet, photo, microchip and emergency contact. We geocode your postcode privately to power the alert radius — your address is never displayed." },
              { n: "02", t: "Generate a QR profile", d: "Every pet gets a tamper-proof QR profile with emergency contact and medical alerts. Print it on a collar tag or add it to a passport." },
              { n: "03", t: "File a lost report", d: "If your pet goes missing, file a lost report in under a minute. We dispatch email alerts to every registered member, vet and rescue within ten miles." },
              { n: "04", t: "Reunite, log, reassure", d: "Sightings are pushed back to you instantly. Mark your pet found — the case closes and the reunification is logged for community trust." },
            ].map((s, i) => (
              <li key={i} className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-2 font-display font-extrabold text-5xl text-[var(--gpr-alert)] leading-none">{s.n}</div>
                <div className="md:col-span-4"><h3 className="font-display font-bold text-2xl text-[var(--gpr-primary)]">{s.t}</h3></div>
                <p className="md:col-span-6 text-lg text-[var(--gpr-muted)] leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Image collage + claim */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          <img src={PET1} alt="" className="rounded-md w-full h-72 md:h-96 object-cover"/>
          <img src={VET} alt="" className="rounded-md w-full h-72 md:h-96 object-cover mt-12"/>
        </div>
        <div className="md:col-span-5">
          <div className="gpr-eyebrow">For professionals</div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[var(--gpr-primary)] mt-3 leading-tight">Built with vets and rescues — not just owners.</h2>
          <p className="text-lg text-[var(--gpr-muted)] mt-5 leading-relaxed">Verified veterinary practices and rescue organisations can submit found reports, scan microchip records and confirm reunifications directly through their portal. Every action is audit-logged.</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <Link to="/vet-register" className="inline-flex items-center gap-1 text-[var(--gpr-primary)] border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">Veterinary registration <ArrowUpRight className="w-4 h-4"/></Link>
            <Link to="/rescue-register" className="inline-flex items-center gap-1 text-[var(--gpr-primary)] border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">Rescue registration <ArrowUpRight className="w-4 h-4"/></Link>
          </div>
        </div>
      </section>

      {/* Premium — dark band, editorial */}
      <section className="bg-[var(--gpr-primary)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <div className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white/60">Premium membership</div>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl mt-4 leading-none">£2.99<span className="text-white/60 text-2xl md:text-3xl font-semibold"> / month</span></h2>
            <p className="text-white/80 mt-6 max-w-xl text-lg leading-relaxed">Family account access, a medical record vault, priority alerts within twenty-five miles and extended document storage. Cancel any time. Free tier always available.</p>
          </div>
          <div className="md:col-span-5 flex md:justify-end gap-3 flex-wrap">
            <Link to="/subscribe" data-testid="cta-subscribe" className="bg-white text-[var(--gpr-primary)] rounded-full px-7 py-3 font-semibold inline-flex items-center gap-2">Upgrade <ArrowRight className="w-4 h-4"/></Link>
            <Link to="/donate" data-testid="cta-donate" className="border-b border-white/40 hover:border-white py-3 font-medium inline-flex items-center gap-2">Donate instead <ArrowUpRight className="w-4 h-4"/></Link>
          </div>
        </div>
      </section>

      {/* Closing — quiet, no boxes */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[var(--gpr-primary)]">It only takes two minutes.</h2>
        <p className="text-lg text-[var(--gpr-muted)] mt-4">Add your pet to the registry now. You'll thank yourself later.</p>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 bg-[var(--gpr-primary)] text-white rounded-full px-7 py-3 font-semibold hover:bg-[var(--gpr-primary-hover)]">Get started <ArrowRight className="w-4 h-4"/></Link>
      </section>
    </div>
  );
}
