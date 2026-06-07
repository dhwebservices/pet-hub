import React from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div data-testid="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <header className="md:col-span-7">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">Contact</div>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--gpr-primary)] leading-[0.98]">Write, and a <em className="accent text-[var(--gpr-alert)]">person</em> answers.</h1>
        <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 max-w-xl leading-[1.6]">No bots, no auto-responders. The registry is staffed by humans who care about reunification — usually back to you within a working day.</p>
      </header>
      <div className="md:col-span-4 md:col-start-9 space-y-10 md:pt-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-3">General &amp; account</div>
          <a href="mailto:hello@globalpetregistry.com" className="font-display font-bold text-xl text-[var(--gpr-primary)] border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">hello@globalpetregistry.com</a>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-3">Press &amp; partnerships</div>
          <a href="mailto:press@globalpetregistry.com" className="font-display font-bold text-xl text-[var(--gpr-primary)] border-b border-[var(--gpr-primary)]/30 hover:border-[var(--gpr-primary)] pb-0.5">press@globalpetregistry.com</a>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gpr-muted)] mb-3">Or open a support ticket</div>
          <Link to="/support" className="gpr-link">Support page →</Link>
        </div>
        <p className="font-serif italic text-[13px] text-[var(--gpr-muted)] pt-4 border-t border-[var(--gpr-border)]">Office hours: Mon–Fri, 09:00–18:00 GMT. Urgent recovery cases are monitored at weekends.</p>
      </div>
    </div>
  );
}
