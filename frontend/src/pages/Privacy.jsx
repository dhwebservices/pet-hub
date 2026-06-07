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
    <div className="max-w-3xl mx-auto px-4 py-16" data-testid="privacy-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Privacy Policy</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Last updated {new Date().toLocaleDateString()}</p>
      <div className="mt-10 space-y-10">{sections.map((s,i)=>(
        <section key={i} className="pb-10 border-b border-[var(--gpr-border)] last:border-b-0"><h2 className="font-display font-bold text-xl text-[var(--gpr-primary)]">{s.t}</h2><p className="text-[var(--gpr-text)] mt-3 leading-relaxed">{s.c}</p></section>
      ))}</div>
    </div>
  );
}
