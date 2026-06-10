import React from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div data-testid="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-10">
      <header className="md:col-span-7">
        <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Contact</div>
        <h1 className="font-extrabold text-5xl md:text-7xl text-[var(--npw-text)] leading-[0.98]">Write, and a <span className="text-[var(--npw-accent)]">person</span> answers.</h1>
        <p className="text-[var(--npw-muted)] text-lg mt-7 max-w-xl leading-[1.6]">No bots, no auto-responders. The registry is staffed by humans who care about reunification — usually back to you within a working day.</p>
      </header>
      <div className="md:col-span-4 md:col-start-9 space-y-10 md:pt-6">
        <div>
          <div className="npw-eyebrow text-[var(--npw-muted)] mb-3">General &amp; account</div>
          <a href="mailto:hello@globalpetregistry.com" className="font-bold text-xl text-[var(--npw-text)] border-b border-[var(--npw-text)]/30 hover:border-[var(--npw-text)] pb-0.5">hello@globalpetregistry.com</a>
        </div>
        <div>
          <div className="npw-eyebrow text-[var(--npw-muted)] mb-3">Press &amp; partnerships</div>
          <a href="mailto:press@globalpetregistry.com" className="font-bold text-xl text-[var(--npw-text)] border-b border-[var(--npw-text)]/30 hover:border-[var(--npw-text)] pb-0.5">press@globalpetregistry.com</a>
        </div>
        <div>
          <div className="npw-eyebrow text-[var(--npw-muted)] mb-3">Or open a support ticket</div>
          <Link to="/support" className="npw-link">Support page →</Link>
        </div>
        <p className="italic text-[13px] text-[var(--npw-muted)] pt-4 border-t border-[var(--npw-border)]">Office hours: Mon–Fri, 09:00–18:00 GMT. Urgent recovery cases are monitored at weekends.</p>
      </div>
    </div>
  );
}
