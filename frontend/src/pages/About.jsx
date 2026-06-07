import React from "react";
const VET_IMG = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16" data-testid="about-page">
      <div className="gpr-eyebrow">About Global Pet Registry</div>
      <h1 className="font-display font-extrabold text-4xl text-[var(--gpr-primary)] mt-2">Built on three principles: trust, speed, and reunification.</h1>
      <p className="mt-6 text-lg text-[var(--gpr-muted)] leading-relaxed">Global Pet Registry is the modern, civic-grade record system pet owners, veterinary practices and rescue organisations rely on to keep families together. Every record is timestamped, every alert is audit-logged, and every public profile hides what should stay private.</p>
      <div className="mt-10 rounded-xl overflow-hidden border border-[var(--gpr-border)]"><img src={VET_IMG} alt="" className="w-full h-80 object-cover"/></div>
      <h2 className="font-display font-bold text-2xl text-[var(--gpr-primary)] mt-12">How recovery works</h2>
      <ol className="mt-4 space-y-3 text-[var(--gpr-text)] leading-relaxed list-decimal pl-5">
        <li>Owners register their pet with photos, microchip, medical and emergency contact details.</li>
        <li>If a pet goes missing, owners file a lost report with the last-seen postcode and circumstances.</li>
        <li>The platform geocodes the postcode and dispatches email alerts to every registered member within a 10-mile radius.</li>
        <li>Members and partners report sightings, which are pushed back to the owner instantly.</li>
        <li>Owners mark the pet found — every reunification is logged for community trust signals.</li>
      </ol>
    </div>
  );
}
