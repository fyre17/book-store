import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCheckout } from "@/lib/cart";
import { mediaUrl } from "@/lib/api";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";

export default function Checkout() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { pending, setPending } = useCheckout();

  const initial = state?.item || pending?.item;
  const type = state?.type || pending?.type || "book";
  const [qty, setQty] = useState(state?.quantity || pending?.quantity || 1);
  const [form, setForm] = useState(
    pending?.form || {
      full_name: "", whatsapp: "", alt_mobile: "", email: "",
      address: "", city: "", state: "", country: "India", pincode: "",
      notes: "", agreed: false,
    }
  );

  useEffect(() => {
    if (!initial) return;
    setPending({ item: initial, type, quantity: qty, form });
    // eslint-disable-next-line
  }, [qty, form, initial]);

  if (!initial) return <Navigate to="/books" replace />;

  const unit = initial.offer_price || initial.price;
  const total = unit * qty;

  const submit = (e) => {
    e.preventDefault();
    if (!form.agreed) return;
    nav("/payment");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const req = (k, label, extra = {}) => (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
        {label} <span className="text-primary">*</span>
      </label>
      <input required value={form[k]} onChange={(e) => set(k, e.target.value)} data-testid={`co-${k}`}
        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" {...extra} />
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Checkout · Step 1 of 2</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold">Shipping details.</h1>

      <div className="mt-10 grid lg:grid-cols-12 gap-10">
        <form onSubmit={submit} className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-border p-6 md:p-8 bg-card space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {req("full_name", "Full name")}
              {req("whatsapp", "WhatsApp number", { type: "tel" })}
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Alt. mobile</label>
                <input value={form.alt_mobile} onChange={(e) => set("alt_mobile", e.target.value)} data-testid="co-alt_mobile"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="co-email"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Complete address <span className="text-primary">*</span></label>
              <textarea required rows={3} value={form.address} onChange={(e) => set("address", e.target.value)} data-testid="co-address"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>

            <div className="grid sm:grid-cols-4 gap-5">
              {req("city", "City")}
              {req("state", "State")}
              {req("country", "Country")}
              {req("pincode", "PIN")}
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Order notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} data-testid="co-notes"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)}
                data-testid="co-agreed"
                className="mt-1 w-4 h-4 accent-primary" />
              <span>I agree to the <a className="link-underline text-primary">Terms & Conditions</a> and confirm my details are correct.</span>
            </label>
          </div>

          <button disabled={!form.agreed} data-testid="co-continue"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100">
            Continue to payment <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <aside className="lg:col-span-4">
          <div className="rounded-3xl border border-border p-6 bg-card sticky top-24">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Order summary</p>
            <div className="mt-5 flex gap-4">
              <img src={mediaUrl(initial.image)} alt={initial.title} className="w-20 h-24 object-cover rounded-lg border border-border" />
              <div className="flex-1">
                <p className="font-serif text-lg leading-tight">{initial.title}</p>
                {type === "book" && <p className="text-xs text-muted-foreground mt-1">by {initial.author}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="co-qty-minus" className="w-7 h-7 rounded-full border border-border">−</button>
                  <span className="font-mono w-8 text-center tabular-nums" data-testid="co-qty">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} data-testid="co-qty-plus" className="w-7 h-7 rounded-full border border-border">+</button>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span>Unit</span><span className="tabular-nums font-mono">₹{unit}</span></div>
              <div className="flex justify-between"><span>Qty</span><span className="tabular-nums font-mono">× {qty}</span></div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between font-semibold">
                <span>Total</span><span className="font-mono tabular-nums text-lg" data-testid="co-total">₹{total}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground space-y-2">
              <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure UPI checkout</p>
              <p className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-primary" /> Ships in 24 hours</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
