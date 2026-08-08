import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCheckout } from "@/lib/cart";
import { api, mediaUrl } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Copy, Upload } from "lucide-react";

export default function Payment() {
  const { pending, setPending } = useCheckout();
  const nav = useNavigate();
  const [settings, setSettings] = useState({});
  const [txn, setTxn] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => { api.get("/settings/public").then((r) => setSettings(r.data)); }, []);

  if (!pending?.item) return <Navigate to="/books" replace />;

  const item = pending.item;
  const type = pending.type;
  const qty = pending.quantity;
  const form = pending.form;
  const total = (item.offer_price || item.price) * qty;

  const submit = async (e) => {
    e.preventDefault();
    if (!txn || !file) { toast.error("Please add transaction ID and screenshot"); return; }
    const fd = new FormData();
    fd.append("item_type", type);
    fd.append("item_id", item.id);
    fd.append("quantity", qty);
    Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === "boolean" ? String(v) : v ?? ""));
    fd.append("transaction_id", txn);
    fd.append("screenshot", file);
    setBusy(true);
    try {
      const res = await api.post("/orders", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(res.data);
      setPending(null);
      toast.success("Order placed! We'll confirm on WhatsApp shortly.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong");
    } finally { setBusy(false); }
  };

  if (success) return (
    <section className="max-w-2xl mx-auto px-4 sm:px-8 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 grid place-items-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="mt-6 font-serif text-4xl md:text-5xl font-bold">Order received.</h1>
      <p className="mt-3 text-muted-foreground">Your order <span className="font-mono">#{success.order_id.slice(0, 8)}</span> is with the owner. Expect a WhatsApp confirmation shortly.</p>
      {!success.telegram && <p className="mt-4 text-xs text-muted-foreground">(Owner Telegram is being configured — order is safely saved.)</p>}
      <div className="mt-8 flex gap-3 justify-center">
        <button onClick={() => nav("/books")} className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary" data-testid="continue-shopping">Keep shopping</button>
        <button onClick={() => nav("/")} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:scale-105 transition-transform">Back home</button>
      </div>
    </section>
  );

  const qrs = [
    { label: "PhonePe", src: settings.phonepe_qr },
    { label: "Google Pay", src: settings.gpay_qr },
    { label: "Paytm", src: settings.paytm_qr },
  ].filter((q) => q.src);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-14">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Checkout · Step 2 of 2</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold">Complete payment.</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">{settings.payment_instructions}</p>

      <div className="mt-10 grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-border p-6 md:p-8 bg-card">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Amount to pay</p>
            <p className="font-mono text-3xl font-semibold tabular-nums">₹{total}</p>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-secondary px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">UPI ID</span>
            <span className="font-mono text-sm flex-1">{settings.upi_id}</span>
            <button onClick={() => { navigator.clipboard.writeText(settings.upi_id || ""); toast.success("Copied"); }}
              className="p-1.5 rounded hover:bg-background transition-colors" data-testid="copy-upi"><Copy className="w-4 h-4" /></button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {qrs.length > 0 ? qrs.map((q) => (
              <div key={q.label} className="rounded-2xl border border-border p-3 text-center">
                <img src={mediaUrl(q.src)} alt={q.label} className="w-full aspect-square object-contain rounded-lg" />
                <p className="mt-2 text-xs font-semibold">{q.label}</p>
              </div>
            )) : (
              <div className="col-span-3 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                <p>QR codes will appear here once the owner uploads them from settings.</p>
                <p className="mt-2">Use the UPI ID above to pay.</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-border p-6 md:p-8 bg-card space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">After paying</p>

          <div>
            <label className="text-sm font-semibold">Transaction ID <span className="text-primary">*</span></label>
            <input required value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="UPI reference / txn id" data-testid="pay-txn"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
          </div>

          <div>
            <label className="text-sm font-semibold">Payment screenshot <span className="text-primary">*</span></label>
            <label htmlFor="scr" className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-border bg-background px-4 py-6 cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-sm">{file ? file.name : "Upload screenshot (PNG/JPG)"}</span>
            </label>
            <input id="scr" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} data-testid="pay-file" className="hidden" />
          </div>

          <button disabled={busy} data-testid="pay-submit"
            className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform duration-200 disabled:opacity-60 disabled:hover:scale-100">
            {busy ? "Submitting..." : `Submit order · ₹${total}`}
          </button>
          <p className="text-xs text-muted-foreground text-center">Your details will be sent to the owner instantly on Telegram.</p>
        </form>
      </div>
    </section>
  );
}
