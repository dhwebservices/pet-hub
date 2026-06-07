import React from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center" data-testid="contact-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Contact us</h1>
      <p className="text-[var(--gpr-muted)] mt-3">Need help, partnerships or media enquiries? Reach the team directly.</p>
      <div className="mt-10 grid sm:grid-cols-2 gap-6 border-t border-[var(--gpr-border)] pt-10">
        <a href="mailto:hello@globalpetregistry.com" className="flex items-start gap-4 py-2 hover:opacity-80">
          <Mail className="w-6 h-6 text-[var(--gpr-primary)] mt-1"/>
          <div className="text-left"><div className="font-display font-bold text-lg">Email</div><div className="text-sm text-[var(--gpr-muted)] mt-1">hello@globalpetregistry.com</div></div>
        </a>
        <Link to="/support" className="flex items-start gap-4 py-2 hover:opacity-80">
          <MessageSquare className="w-6 h-6 text-[var(--gpr-primary)] mt-1"/>
          <div className="text-left"><div className="font-display font-bold text-lg">Support ticket</div><div className="text-sm text-[var(--gpr-muted)] mt-1">Open a ticket — we reply within 24 h</div></div>
        </Link>
      </div>
    </div>
  );
}
