import React from "react";

const sections = [
  { t: "Acceptance", c: "By using Global Pet Registry you agree to these terms. If you do not agree, please do not use the service." },
  { t: "Accurate information", c: "You agree to provide accurate, current information for yourself and your pet. Misuse of the alert network is grounds for account suspension." },
  { t: "Service availability", c: "We provide the platform 'as is' and aim for high availability, but no guarantees are made against outages, network delays or third-party service interruptions." },
  { t: "Subscriptions", c: "Premium subscriptions are billed monthly via Stripe and can be cancelled at any time from your dashboard. Refunds are handled case by case." },
  { t: "Liability", c: "Global Pet Registry is a recovery network and best-effort communication platform. We do not guarantee recovery or replace local authorities, microchip databases or veterinary care." },
];

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16" data-testid="terms-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Terms of Service</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Last updated {new Date().toLocaleDateString()}</p>
      <div className="mt-10 space-y-10">{sections.map((s,i)=>(
        <section key={i} className="pb-10 border-b border-[var(--gpr-border)] last:border-b-0"><h2 className="font-display font-bold text-xl text-[var(--gpr-primary)]">{s.t}</h2><p className="text-[var(--gpr-text)] mt-3 leading-relaxed">{s.c}</p></section>
      ))}</div>
    </div>
  );
}
