import React from "react";
const VET_IMG = "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1400";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-12 grid md:grid-cols-12 gap-x-14">
        <div className="md:col-span-8">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">On the registry · Issue №&nbsp;01</div>
          <h1 className="font-extrabold text-5xl md:text-7xl text-[var(--npw-text)] leading-[0.98]">Built on three principles: <span className="text-[var(--npw-accent)]">trust, speed, reunification</span>.</h1>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-12 gap-x-14 gap-y-10">
        <div className="md:col-span-7 md:col-start-2">
          <p className="text-[19px] leading-[1.7] text-[var(--npw-text)]">National Pet Watch is the modern, civic-grade record system pet owners, veterinary practices and rescue organisations rely on to keep families together. Every record is timestamped, every alert is audit-logged, and every public profile hides what should stay private. We do not sell data, we do not advertise to members, and we do not replace your microchip — we make it work faster.</p>
        </div>
        <aside className="md:col-span-3 md:col-start-10 md:pt-3">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-3">Editorial position</div>
          <p className="italic text-[15px] text-[var(--npw-muted)] leading-[1.6]">"A registry that is silent during a missing pet is not a registry — it is a filing cabinet."</p>
        </aside>
      </section>
      <section>
        <img src={VET_IMG} alt="" className="w-full h-[60vh] min-h-[420px] object-cover"/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <figcaption className="italic text-[13px] text-[var(--npw-muted)] max-w-xl"><span className="not-italic text-[11px] font-bold uppercase tracking-wider mr-2">Fig. A</span>The registry is built with the professionals who already do the work.</figcaption>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-x-14">
        <div className="md:col-span-3">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)]">§ How recovery works</div>
        </div>
        <ol className="md:col-span-8 space-y-10  text-[18px] text-[var(--npw-text)] leading-[1.55]">
          {[
            "An owner registers their pet with photographs, microchip, medical and emergency contact details.",
            "If a pet goes missing, the owner files a lost report with the last-seen postcode and circumstances.",
            "The platform geocodes the postcode and dispatches email alerts to every registered member, veterinary practice and rescue within a ten-mile radius.",
            "Members and partners report sightings, which are emailed back to the owner instantly.",
            "Owners mark the pet found — every reunification is logged for community trust signals.",
          ].map((s, i) => (
            <li key={i} className="grid grid-cols-12 gap-6 pb-10 border-b border-[var(--npw-border)] last:border-b-0">
              <span className="col-span-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--npw-warn)] pt-2">{String(i+1).padStart(2,'0')}</span>
              <span className="col-span-11 italic">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
