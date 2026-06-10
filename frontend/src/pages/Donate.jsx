import React from "react";

const PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=FN55GF47FEC4J";

export default function Donate() {
  return (
    <div data-testid="donate-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-12">
      <header className="md:col-span-7">
        <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Support National Pet Watch</div>
        <h1 className="font-extrabold text-5xl md:text-7xl text-[var(--npw-text)] leading-[0.95]">Free to use. <span className="text-[var(--npw-accent)]">Supported by donations</span>.</h1>
        <p className="text-[var(--npw-muted)] text-lg mt-8 max-w-xl leading-[1.6]">
          National Pet Watch exists to help reunite lost pets with their owners and support animal welfare. Donations help cover hosting, development and future integrations with veterinary practices, rescues and animal charity partners.
        </p>
        <p className="text-[var(--npw-muted)] text-lg mt-5 max-w-xl leading-[1.6]">
          National Pet Watch is provided free of charge. If our platform has helped reunite a pet with its family, please consider supporting our work.
        </p>
      </header>
      <div className="md:col-span-4 md:col-start-9 md:pt-6">
        <div className="bg-[var(--npw-canvas)] border border-[var(--npw-border)] rounded-2xl p-6">
          <div className="npw-eyebrow text-[var(--npw-muted)] mb-4">Secure donation</div>
          <p className="text-[15px] text-[var(--npw-muted)] leading-relaxed">
            Donations are processed securely by PayPal. They are always optional and no National Pet Watch features are restricted by payment.
          </p>
          <a
            data-testid="paypal-donate-button"
            href={PAYPAL_DONATE_URL}
            target="_blank"
            rel="noreferrer"
            className="npw-btn-warning mt-8"
          >
            Donate with PayPal →
          </a>
        </div>
      </div>
    </div>
  );
}
