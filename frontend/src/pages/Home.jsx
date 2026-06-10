import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { ArrowRight, ShieldCheck, MapPin, Bell, QrCode, Stethoscope, Heart } from "lucide-react";

const HERO_DOG = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?crop=entropy&cs=srgb&fm=jpg&w=1400&q=85";
const HERO_CAT = "https://images.unsplash.com/photo-1574158622682-e40e69881006?crop=entropy&cs=srgb&fm=jpg&w=900&q=85";

export default function Home() {
  const [stats, setStats] = useState({ lost: null, found: null });
  useEffect(() => {
    Promise.all([api.get("/lost").catch(()=>({data:[]})), api.get("/found").catch(()=>({data:[]}))])
      .then(([l,f]) => setStats({ lost: l.data.length, found: f.data.length }));
  }, []);

  return (
    <div data-testid="home-page">

      {/* HERO */}
      <section className="max-w-[1240px] mx-auto px-4 lg:px-6 pt-10 md:pt-16 pb-16">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <div className="npw-eyebrow mb-5">A UK community service</div>
            <h1 className="text-[44px] md:text-[60px] leading-[1.04] tracking-tight font-extrabold">
              Reuniting families with their <span className="text-[var(--npw-accent)]">lost pets</span>.
            </h1>
            <p className="mt-6 text-[18px] md:text-[20px] text-[var(--npw-muted)] leading-relaxed max-w-xl">
              A free service that helps owners, neighbours, veterinary practices and rescues work together when a pet goes missing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" data-testid="hero-register-cta" className="npw-btn-primary">Register your pet <ArrowRight className="w-4 h-4"/></Link>
              <Link to="/report-lost" data-testid="hero-report-lost-cta" className="npw-btn-action">Report a lost pet</Link>
            </div>
            <p className="mt-5 text-[14px] text-[var(--npw-muted)]">If your pet has been stolen, please also contact the police on 101.</p>
            <div className="mt-8 flex items-center gap-6 text-[14px] text-[var(--npw-muted)]">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--npw-success)]"/> Verified records</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--npw-primary)]"/> 10-mile alerts</span>
              <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-[var(--npw-accent)]"/> Donor-funded</span>
            </div>
          </div>

          {/* Hero collage */}
          <div className="md:col-span-6 relative">
            <div className="relative grid grid-cols-5 grid-rows-6 gap-3 h-[440px] md:h-[520px]">
              <img src={HERO_DOG} alt="" className="col-span-3 row-span-6 rounded-3xl object-cover w-full h-full"/>
              <img src={HERO_CAT} alt="" className="col-span-2 row-span-3 col-start-4 rounded-3xl object-cover w-full h-full"/>
              <div className="col-span-2 row-span-3 col-start-4 row-start-4 rounded-3xl bg-[var(--npw-canvas)] p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2"><span className="relative flex w-2.5 h-2.5"><span className="absolute inset-0 rounded-full bg-[var(--npw-accent)] animate-ping opacity-70"/><span className="relative w-2.5 h-2.5 rounded-full bg-[var(--npw-accent)]"/></span><span className="text-[12px] font-bold text-[var(--npw-accent)] uppercase tracking-wider">Live</span></div>
                <div>
                  <div className="text-[36px] font-extrabold leading-none">{stats.lost ?? "—"}</div>
                  <div className="text-[13px] text-[var(--npw-muted)] mt-1">active lost reports across the UK</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 4 friendly icon steps */}
      <section className="bg-[var(--npw-canvas)] border-y border-[var(--npw-border)]">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-6 items-end mb-12">
            <div className="md:col-span-7">
              <div className="npw-eyebrow mb-3">How the service works</div>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-extrabold">A search party already waiting, the day you ever need one.</h2>
            </div>
            <p className="md:col-span-5 text-[17px] text-[var(--npw-muted)] leading-relaxed">It takes two minutes to register. If your pet ever goes missing, we put their photograph in front of every member nearby — within minutes.</p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { i: QrCode, n: "01", t: "Register", b: "Add your pet's details, photograph, microchip and emergency contact." },
              { i: Bell, n: "02", t: "If missing, report", b: "File a lost report with the last-seen postcode. Two minutes." },
              { i: MapPin, n: "03", t: "10-mile alert", b: "Every registered member nearby is emailed with the photograph and area." },
              { i: ShieldCheck, n: "04", t: "Reunite", b: "Sightings come back to you instantly. Mark your pet found when home." },
            ].map((s,i)=>(
              <li key={i} className="bg-white rounded-2xl p-6 border border-[var(--npw-border)]">
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--npw-primary-soft)] text-[var(--npw-primary)]"><s.i className="w-5 h-5"/></span>
                  <span className="text-[12px] font-bold text-[var(--npw-muted)] tracking-wider">{s.n}</span>
                </div>
                <h3 className="text-[18px] font-bold">{s.t}</h3>
                <p className="text-[15px] text-[var(--npw-muted)] leading-relaxed mt-2">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SERVICES — rounded card grid, friendly photos */}
      <section className="bg-white">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-6 py-16 md:py-20">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <div>
              <div className="npw-eyebrow mb-3">Services</div>
              <h2 className="text-[32px] md:text-[40px] leading-tight font-extrabold">Everything we offer, in one place.</h2>
            </div>
            <p className="text-[16px] text-[var(--npw-muted)] max-w-md">All services are free to use. Optional donations help keep them that way.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { to:"/register-pet", h:"Register a pet", b:"Add your pet to the national register with photographs, microchip and emergency contact." },
              { to:"/report-lost", h:"Report a lost pet", b:"Tell us your pet is missing. We email every registered member within 10 miles." },
              { to:"/report-found", h:"Report a found pet", b:"Found someone's pet? Submit a report so we can help reunite them with their owner." },
              { to:"/lost-pets", h:"View lost pets", b:"See pets currently reported missing across the UK and report sightings." },
              { to:"/map", h:"Lost & found map", b:"Browse an interactive map of lost and found pets in your area." },
              { to:"/search", h:"Search the register", b:"Search by name, breed or microchip number across all public records." },
            ].map((s,i)=>(
              <Link key={i} to={s.to} className="npw-service-card group" data-testid={`service-${i}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-bold text-[var(--npw-text)] group-hover:text-[var(--npw-primary)]">{s.h}</h3>
                  <ArrowRight className="w-5 h-5 text-[var(--npw-muted)] group-hover:text-[var(--npw-primary)] transition group-hover:translate-x-1"/>
                </div>
                <p className="mt-3 text-[15px] text-[var(--npw-muted)] leading-relaxed">{s.b}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSIONALS */}
      <section className="bg-[var(--npw-primary)] text-white relative overflow-hidden">
        <div className="absolute -right-32 -bottom-32 w-[420px] h-[420px] rounded-full bg-white/5 pointer-events-none"/>
        <div className="absolute -left-24 top-10 w-[300px] h-[300px] rounded-full bg-[var(--npw-accent)]/12 pointer-events-none"/>
        <div className="relative max-w-[1240px] mx-auto px-4 lg:px-6 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 text-white/90 text-[12px] font-bold uppercase tracking-wider"><Stethoscope className="w-3.5 h-3.5"/> For professionals</span>
            <h2 className="mt-6 text-[32px] md:text-[44px] font-extrabold leading-[1.08]">Built with the practices and rescues who already do the work.</h2>
            <p className="mt-5 text-white/85 text-[17px] leading-relaxed max-w-xl">Verified veterinary practices and rescue organisations can submit found reports, scan microchip records and confirm reunifications directly. There is no charge for participating partners.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/vet-register" className="npw-btn-action">Register a veterinary practice</Link>
              <Link to="/rescue-register" className="bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 transition">Register a rescue <ArrowRight className="w-4 h-4"/></Link>
            </div>
          </div>
          <blockquote className="md:col-span-5 border-l-4 border-[var(--npw-accent)] pl-6 text-white/90">
            <p className="text-[20px] leading-relaxed">"Recovery is a community event, not a database query. The faster you can put a photograph in front of the right person on the right street, the better the outcome."</p>
            <footer className="mt-5 text-[14px] text-white/70">Dr. Helen Maris &middot; Veterinary surgeon, MRCVS</footer>
          </blockquote>
        </div>
      </section>

      {/* SUPPORT THE SERVICE */}
      <section className="bg-white">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div className="npw-eyebrow mb-3">Supporting the service</div>
              <h2 className="text-[32px] md:text-[40px] leading-tight font-extrabold">Free for everyone. <br/>Funded by people who care.</h2>
              <p className="mt-5 text-[17px] text-[var(--npw-muted)] leading-relaxed max-w-md">National Pet Watch is provided free of charge. If our platform has helped reunite a pet with its family, please consider supporting our work.</p>
            </div>
            <div className="md:col-span-7 grid sm:grid-cols-2 gap-5">
              <div className="bg-[var(--npw-canvas)] p-6 rounded-2xl">
                <div className="npw-eyebrow">Optional support</div>
                <div className="mt-3 flex items-baseline gap-2"><span className="text-[42px] font-extrabold leading-none">Free</span><span className="text-[15px] text-[var(--npw-muted)]">for every user</span></div>
                <ul className="mt-5 space-y-2 text-[15px]">
                  <li className="flex gap-2"><span className="text-[var(--npw-success)] font-bold">✓</span> Pet registration</li>
                  <li className="flex gap-2"><span className="text-[var(--npw-success)] font-bold">✓</span> Lost and found alerts</li>
                  <li className="flex gap-2"><span className="text-[var(--npw-success)] font-bold">✓</span> Veterinary and rescue participation</li>
                </ul>
                <Link to="/register" data-testid="cta-register-free" className="npw-btn-primary mt-6">Create a free account</Link>
              </div>
              <div className="bg-[var(--npw-accent-soft)] p-6 rounded-2xl">
                <div className="npw-eyebrow">One-off donation</div>
                <div className="mt-3 flex items-baseline gap-2"><span className="text-[42px] font-extrabold leading-none text-[var(--npw-accent)]">£</span><span className="text-[42px] font-extrabold leading-none text-[var(--npw-accent)]">10</span><span className="text-[15px] text-[var(--npw-muted)]">or any amount</span></div>
                <p className="mt-5 text-[15px] text-[var(--npw-muted)] leading-relaxed">Donations help cover hosting, development and future integrations with veterinary practices, rescues and animal charities.</p>
                <Link to="/donate" data-testid="cta-donate" className="npw-btn-action mt-6">Donate with PayPal</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="max-w-[1240px] mx-auto px-4 lg:px-6 py-16 md:py-20">
        <div className="bg-[var(--npw-canvas)] rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-[28px] md:text-[36px] font-extrabold leading-tight">Register your pet today, before you need to.</h2>
            <p className="mt-3 text-[16px] text-[var(--npw-muted)]">Two minutes. No charge. Your home address stays private.</p>
          </div>
          <Link to="/register" className="npw-btn-primary !text-[16px]">Get started <ArrowRight className="w-4 h-4"/></Link>
        </div>
      </section>
    </div>
  );
}
