import React from "react";

const sections = [
  { t: "Data we collect", c: "Account details (name, email, postcode), pet records you provide, and audit logs for lost-pet alerts. Postcodes are geocoded to coordinates so we can match radius alerts." },
  { t: "How we use your data", c: "To operate the registry, dispatch lost-pet alerts in your area, and provide secure veterinary or rescue verification. We never sell personal data." },
  { t: "Public information", c: "QR pet profiles show the pet's name, photo, emergency contact and medical alerts. Owner home addresses are never displayed publicly." },
  { t: "Cookies", c: "We use a session cookie to keep you signed in. No third-party tracking cookies." },
  { t: "Your rights", c: "You can edit, export or delete your data at any time from your dashboard. Email support@globalpetregistry.com for assistance." },
];

export default function Privacy() {
  return (
    <div data-testid="privacy-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <header className="grid md:grid-cols-12 gap-x-14 mb-16">
        <div className="md:col-span-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">Statement of Privacy · {new Date().toLocaleDateString('en-GB', {year:'numeric', month:'long'})}</div>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--gpr-primary)] leading-[0.98]">How your data is <em className="accent text-[var(--gpr-alert)]">handled</em>.</h1>
        </div>
      </header>
      <div className="grid md:grid-cols-12 gap-x-14 gap-y-12">
        {sections.map((s,i)=>(
          <section key={i} className="md:col-span-12 grid grid-cols-12 gap-x-6 py-10 border-t border-[var(--gpr-border)] last:border-b last:border-b-[var(--gpr-border)]">
            <span className="col-span-12 md:col-span-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)]">§ {String(i+1).padStart(2,'0')}</span>
            <h2 className="col-span-12 md:col-span-4 font-display font-bold text-2xl text-[var(--gpr-primary)] mt-2 md:mt-0">{s.t}</h2>
            <p className="col-span-12 md:col-span-6 font-serif text-[17px] text-[var(--gpr-text)] leading-[1.65] mt-3 md:mt-0">{s.c}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
