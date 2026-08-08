import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, Clock, Send, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [s, setS] = useState({});
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => { api.get("/settings/public").then((r) => setS(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try { await api.post("/contact", form); toast.success("Message sent. We'll get back within a day."); setForm({ name: "", email: "", message: "" }); }
    catch { toast.error("Please check your email and try again."); }
    finally { setSending(false); }
  };

  const cards = [
    { icon: Mail, label: "Email", value: s.email },
    { icon: Phone, label: "Phone", value: s.phone },
    { icon: MessageCircle, label: "WhatsApp", value: s.whatsapp },
    { icon: MapPin, label: "Address", value: s.address },
    { icon: Clock, label: "Hours", value: s.hours },
  ];

  return (
    <>
      <section className="warm-gradient border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Say hello</p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl font-bold leading-tight">We reply. Always.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Questions on a title, a course, a return — whatever it is, we're one message away.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-border p-6 bg-card">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Owner</p>
            <p className="mt-2 font-serif text-2xl">{s.owner_name}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border p-5 bg-card">
                <c.icon className="w-5 h-5 text-primary" />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-sm leading-relaxed">{c.value || "—"}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden border border-border aspect-[16/10]">
            <iframe title="Map" src={s.map_embed} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>

        <div className="lg:col-span-7">
          <form onSubmit={submit} className="rounded-3xl border border-border p-8 bg-card space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Your name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Message</label>
              <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>
            <button disabled={sending} data-testid="contact-submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:hover:scale-100">
              <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
