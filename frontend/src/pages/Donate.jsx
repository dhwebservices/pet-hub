import React, { useState } from "react";
import { api } from "../lib/api";

export default function Donate() {
  const [amount, setAmount] = useState(15);
  const [msg, setMsg] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async () => {
    setMsg(""); setLoading(true);
    try {
      const { data } = await api.post(`/donations/create?amount=${amount}&currency=GBP`);
      if (data.mocked) setMsg(`Thank you. PayPal not yet configured — your donation has been recorded in MOCKED mode (order ${data.order_id}).`);
      else setMsg(`Order ${data.order_id} created. Complete the payment in the PayPal popup.`);
    } catch (e) { setMsg(e.message); } finally { setLoading(false); }
  };
  return (
    <div data-testid="donate-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-x-14 gap-y-12">
      <header className="md:col-span-7">
        <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--npw-muted)] mb-6">Support the recovery network</div>
        <h1 className="font-extrabold text-5xl md:text-7xl text-[var(--npw-text)] leading-[0.95]">A small gift, a <span className="text-[var(--npw-accent)]">larger search party</span>.</h1>
        <p className="text-[var(--npw-muted)] text-lg mt-8 max-w-xl leading-[1.6]">Donations keep the alert network free for owners who can't afford Premium. Every pound goes towards radius-alert dispatches and verification of vets and rescues.</p>
      </header>
      <div className="md:col-span-4 md:col-start-9 md:pt-6">
        <div className="npw-eyebrow text-[var(--npw-muted)] mb-4">Choose an amount</div>
        <div className="flex flex-wrap gap-2">
          {[5,10,15,25,50,100].map(v => (
            <button key={v} type="button" onClick={()=>setAmount(v)} data-testid={`donate-${v}`} className={`text-sm px-4 py-2 rounded-sm border transition-colors ${amount===v?'bg-[var(--npw-text)] text-white border-[var(--npw-text)]':'bg-transparent border-[var(--npw-border)] text-[var(--npw-text)] hover:border-[var(--npw-text)]'}`}>£{v}</button>
          ))}
        </div>
        <div className="mt-8">
          <label className="npw-label">Custom amount (GBP)</label>
          <input type="number" min="1" className="npw-input" value={amount} onChange={e=>setAmount(Number(e.target.value)||1)} data-testid="donate-amount"/>
        </div>
        <button data-testid="donate-submit" disabled={loading} onClick={submit} className="npw-btn-warning mt-10">{loading?"Processing…":`Donate £${amount} via PayPal →`}</button>
        {msg && <div className="italic text-[15px] text-[var(--npw-muted)] mt-6 leading-[1.6]">{msg}</div>}
      </div>
    </div>
  );
}
