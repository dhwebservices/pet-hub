import React from "react";

const sections = [
  { t: "Acceptance", c: "By using National Pet Watch you agree to these terms. If you do not agree, please do not use the service." },
  { t: "Accurate information", c: "You agree to provide accurate, current information for yourself and your pet. Misuse of the alert network is grounds for account suspension." },
  { t: "Service availability", c: "We provide the platform 'as is' and aim for high availability, but no guarantees are made against outages, network delays or third-party service interruptions." },
  { t: "Free access and donations", c: "National Pet Watch is free to use. Donations are optional, do not unlock additional platform features, and do not affect access to any recovery tools." },
  { t: "Liability", c: "National Pet Watch is a recovery network and best-effort communication platform. We do not guarantee recovery or replace local authorities, microchip databases or veterinary care." },
];

export default function Terms() {
  return (
    <div data-testid="terms-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <header className="grid md:grid-cols-12 gap-x-14 mb-16">
        <div className="md:col-span-8">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Terms of Service · {new Date().toLocaleDateString('en-GB', {year:'numeric', month:'long'})}</div>
          <h1 className="font-extrabold text-5xl md:text-7xl text-[var(--npw-text)] leading-[0.98]">The <span className="text-[var(--npw-accent)]">small print</span>, written plainly.</h1>
        </div>
      </header>
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-12">
        {sections.map((s,i)=>(
          <section key={i} className="md:col-span-12 grid grid-cols-12 gap-x-6 py-10 border-t border-[var(--npw-border)] last:border-b last:border-b-[var(--npw-border)]">
            <span className="col-span-12 md:col-span-2 npw-eyebrow text-[var(--npw-muted)]">§ {String(i+1).padStart(2,'0')}</span>
            <h2 className="col-span-12 md:col-span-4 font-bold text-2xl text-[var(--npw-text)] mt-2 md:mt-0">{s.t}</h2>
            <p className="col-span-12 md:col-span-6  text-[17px] text-[var(--npw-text)] leading-[1.65] mt-3 md:mt-0">{s.c}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
