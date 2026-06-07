import React from "react";
const VET_IMG = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1400";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-12 grid md:grid-cols-12 gap-x-14">
        <div className="md:col-span-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">On the registry · Issue №&nbsp;01</div>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--gpr-primary)] leading-[0.98]">Built on three principles: <em className="accent text-[var(--gpr-alert)]">trust, speed, reunification</em>.</h1>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-12 gap-x-14 gap-y-10">
        <div className="md:col-span-7 md:col-start-2">
          <p className="dropcap text-[19px] leading-[1.7] text-[var(--gpr-text)]">Global Pet Registry is the modern, civic-grade record system pet owners, veterinary practices and rescue organisations rely on to keep families together. Every record is timestamped, every alert is audit-logged, and every public profile hides what should stay private. We do not sell data, we do not advertise to members, and we do not replace your microchip — we make it work faster.</p>
        </div>
        <aside className="md:col-span-3 md:col-start-10 md:pt-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-3">Editorial position</div>
          <p className="font-serif italic text-[15px] text-[var(--gpr-muted)] leading-[1.6]">"A registry that is silent during a missing pet is not a registry — it is a filing cabinet."</p>
        </aside>
      </section>
      <section>
        <img src={VET_IMG} alt="" className="w-full h-[60vh] min-h-[420px] object-cover"/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <figcaption className="font-serif italic text-[13px] text-[var(--gpr-muted)] max-w-xl"><span className="not-italic font-mono text-[10px] uppercase tracking-[0.2em] mr-2">Fig. A</span>The registry is built with the professionals who already do the work.</figcaption>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-x-14">
        <div className="md:col-span-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)]">§ How recovery works</div>
        </div>
        <ol className="md:col-span-8 space-y-10 font-serif text-[18px] text-[var(--gpr-text)] leading-[1.55]">
          {[
            "An owner registers their pet with photographs, microchip, medical and emergency contact details.",
            "If a pet goes missing, the owner files a lost report with the last-seen postcode and circumstances.",
            "The platform geocodes the postcode and dispatches email alerts to every registered member, veterinary practice and rescue within a ten-mile radius.",
            "Members and partners report sightings, which are emailed back to the owner instantly.",
            "Owners mark the pet found — every reunification is logged for community trust signals.",
          ].map((s, i) => (
            <li key={i} className="grid grid-cols-12 gap-6 pb-10 border-b border-[var(--gpr-border)] last:border-b-0">
              <span className="col-span-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gpr-alert)] pt-2">{String(i+1).padStart(2,'0')}</span>
              <span className="col-span-11 italic">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
