import { useEffect, useState } from "react";
import { api, mediaUrl, BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";

const F = ({ label, hint, children }) => (
  <label className="block">
    <span className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</span>
    {hint && <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>}
    <div className="mt-2">{children}</div>
  </label>
);
const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40";

export default function AdminSettings() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/settings").then((r) => setS(r.data)); }, []);
  if (!s) return <p>Loading...</p>;

  const set = (k, v) => setS({ ...s, [k]: v });
  const uploadQR = async (key, e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    const res = await api.post("/upload", fd);
    set(key, `${BACKEND_URL}${res.data.url}`);
  };

  const save = async () => {
    try { await api.put("/admin/settings", s); toast.success("Settings saved"); }
    catch (err) { toast.error(err?.response?.data?.detail || "Save failed"); }
  };

  const qrBox = (key, label) => (
    <div className="rounded-2xl border border-border p-4 bg-background text-center">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</p>
      {s[key] ? <img src={mediaUrl(s[key])} alt={label} className="mt-3 mx-auto max-h-40 rounded" /> :
        <div className="mt-3 h-40 rounded border border-dashed border-border grid place-items-center text-xs text-muted-foreground">No image</div>}
      <label className="mt-3 inline-flex items-center gap-2 text-xs cursor-pointer link-underline">
        <Upload className="w-3 h-3" /> {s[key] ? "Replace" : "Upload"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadQR(key, e)} data-testid={`upload-${key}`} />
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Settings</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Store settings.</h1>
        </div>
        <button onClick={save} data-testid="save-settings" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:scale-105 transition-transform">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {qrBox("phonepe_qr", "PhonePe QR")}
        {qrBox("gpay_qr", "Google Pay QR")}
        {qrBox("paytm_qr", "Paytm QR")}
      </div>

      <section className="rounded-2xl border border-border p-6 bg-card space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Payments</p>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="UPI ID"><input value={s.upi_id} onChange={(e) => set("upi_id", e.target.value)} className={inp} data-testid="upi-id" /></F>
          <F label="Payment instructions"><textarea rows={2} value={s.payment_instructions} onChange={(e) => set("payment_instructions", e.target.value)} className={`${inp} resize-none`} /></F>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6 bg-card space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Telegram bot</p>
        <p className="text-xs text-muted-foreground">Get token from @BotFather, then send /start to your bot. Your Chat ID appears at api.telegram.org/bot&lt;TOKEN&gt;/getUpdates.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Bot token"><input value={s.telegram_bot_token} onChange={(e) => set("telegram_bot_token", e.target.value)} className={inp} placeholder="123456:ABC-..." data-testid="tg-token" /></F>
          <F label="Chat ID"><input value={s.telegram_chat_id} onChange={(e) => set("telegram_chat_id", e.target.value)} className={inp} placeholder="123456789" data-testid="tg-chat" /></F>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6 bg-card space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Business</p>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Website name"><input value={s.site_name} onChange={(e) => set("site_name", e.target.value)} className={inp} /></F>
          <F label="Logo URL"><input value={s.logo} onChange={(e) => set("logo", e.target.value)} className={inp} /></F>
          <F label="Owner name"><input value={s.owner_name} onChange={(e) => set("owner_name", e.target.value)} className={inp} /></F>
          <F label="Email"><input value={s.email} onChange={(e) => set("email", e.target.value)} className={inp} /></F>
          <F label="Phone"><input value={s.phone} onChange={(e) => set("phone", e.target.value)} className={inp} /></F>
          <F label="WhatsApp"><input value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inp} /></F>
          <F label="Address"><input value={s.address} onChange={(e) => set("address", e.target.value)} className={inp} /></F>
          <F label="Business hours"><input value={s.hours} onChange={(e) => set("hours", e.target.value)} className={inp} /></F>
          <F label="Footer text"><input value={s.footer} onChange={(e) => set("footer", e.target.value)} className={inp} /></F>
          <F label="Map embed URL"><input value={s.map_embed} onChange={(e) => set("map_embed", e.target.value)} className={inp} /></F>
        </div>
      </section>

      <section className="rounded-2xl border border-border p-6 bg-card space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Social</p>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Telegram"><input value={s.telegram} onChange={(e) => set("telegram", e.target.value)} className={inp} /></F>
          <F label="Instagram"><input value={s.instagram} onChange={(e) => set("instagram", e.target.value)} className={inp} /></F>
          <F label="Facebook"><input value={s.facebook} onChange={(e) => set("facebook", e.target.value)} className={inp} /></F>
          <F label="YouTube"><input value={s.youtube} onChange={(e) => set("youtube", e.target.value)} className={inp} /></F>
        </div>
      </section>
    </div>
  );
}
