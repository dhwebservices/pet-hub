import React, { useState } from "react";
import { api } from "../lib/api";
import { Heart } from "lucide-react";

export default function Donate() {
  const [amount, setAmount] = useState(15);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setMsg(""); setLoading(true);
    try {
      const { data } = await api.post(`/donations/create?amount=${amount}&currency=GBP`);
      if (data.mocked) { setMsg(`Thank you! (PayPal not configured — donation recorded in MOCKED mode, order ${data.order_id}).`); }
      else { setMsg(`Order ${data.order_id} created. Complete in PayPal popup (integration ready — please add PayPal Buttons script).`); }
    } catch (e) { setMsg(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-16" data-testid="donate-page">
      <div className="text-center">
        <Heart className="w-8 h-8 mx-auto text-[var(--gpr-alert)]"/>
        <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)] mt-3">Support the recovery network</h1>
        <p className="text-[var(--gpr-muted)] mt-2">Your donation keeps the alert network free for owners who can't afford Premium.</p>
      </div>
      <div className="mt-12 border-t border-[var(--gpr-border)] pt-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {[5,10,15,25,50,100].map(v => (
            <button key={v} type="button" onClick={()=>setAmount(v)} data-testid={`donate-${v}`} className={`px-5 py-2 rounded-full border text-sm font-medium ${amount===v?'bg-[var(--gpr-primary)] text-white border-[var(--gpr-primary)]':'border-[var(--gpr-border)] text-[var(--gpr-text)] bg-white hover:border-[var(--gpr-ring)]'}`}>£{v}</button>
          ))}
        </div>
        <div className="mt-6 max-w-xs mx-auto">
          <label className="gpr-label">Custom amount (GBP)</label>
          <input type="number" min="1" className="gpr-input" value={amount} onChange={e=>setAmount(Number(e.target.value)||1)} data-testid="donate-amount"/>
        </div>
        <button data-testid="donate-submit" disabled={loading} onClick={submit} className="gpr-btn-primary mt-8 w-full max-w-xs mx-auto block">{loading?"Processing…":`Donate £${amount} via PayPal`}</button>
        {msg && <div className="mt-4 text-sm text-[var(--gpr-muted)] text-center">{msg}</div>}
      </div>
    </div>
  );
}
