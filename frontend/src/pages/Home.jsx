import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BookOpen, ShieldCheck, Zap, HeartHandshake, Star, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

const FEATURES = [
  { icon: ShieldCheck, title: "100% Secure Payments", body: "UPI, PhonePe, GPay, Paytm. Every order verified by a human." },
  { icon: Zap, title: "Instant Order Confirmation", body: "Your details reach us in real time. No waiting. No wondering." },
  { icon: HeartHandshake, title: "Trusted by 12,400+ Readers", body: "Curated titles, honest ratings, and support you can text." },
];

const BENEFITS = [
  { n: "01", t: "Better sleep, sharper mind", d: "20 minutes of reading a night lowers cortisol by up to 68%." },
  { n: "02", t: "A quieter attention", d: "Long-form books rebuild the deep-focus muscle screens erode daily." },
  { n: "03", t: "Empathy, on demand", d: "Fiction increases theory-of-mind — how you read people, and yourself." },
  { n: "04", t: "Compound learning", d: "One book a month is 12 mentors a year. Courses turn that into craft." },
];

const REVIEWS = [
  { name: "Aditi P.", role: "Product designer, Bengaluru",
    body: "The curation is unreal. Every book I bought here ended up dog-eared and gifted. Also — order confirmations on Telegram? Chef's kiss.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200" },
  { name: "Rahul M.", role: "Founder, indie SaaS",
    body: "Bought \"The Founder's Field Notes\" and the writing course. Two weeks later I shipped v1. This place is dangerously good for weekends.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
  { name: "Sana R.", role: "Writer & educator",
    body: "The checkout feels handmade — no dark patterns, no upsells. Just a shop that respects your evening.",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200" },
];

const FAQS = [
  { q: "How do I receive my order after paying?", a: "Once you upload the payment screenshot, our owner receives your order on Telegram instantly and confirms via WhatsApp within a few hours." },
  { q: "Can I return a book?", a: "Yes — unopened books can be returned within 7 days. We refund via the same UPI you paid with." },
  { q: "Do courses expire?", a: "No. Once purchased, you keep lifetime access, including all future updates to the course." },
  { q: "Is my payment safe?", a: "Payments go directly to our verified UPI. We never store your card or UPI PIN. All screenshots are stored securely." },
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    api.get("/books", { params: { sort: "popular" } }).then((r) => setBooks(r.data.slice(0, 8))).catch(() => {});
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    try { await api.post("/newsletter", { email }); toast.success("You're on the list. Welcome."); setEmail(""); }
    catch { toast.error("Please enter a valid email"); }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden warm-gradient">
        <div className="grain absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5" /> New titles, every Sunday
              </span>
              <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-foreground">
                Books that build
                <br />
                <em className="italic text-primary">better minds.</em>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                A hand-picked storefront for readers, makers and slow thinkers. Premium books & studio-grade courses — with instant confirmation on Telegram.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/books" data-testid="hero-shop-books" className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-105 hover:shadow-[0_20px_40px_rgb(217,93,57,0.25)] transition-[transform,box-shadow] duration-300">
                  Shop books <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/courses" data-testid="hero-view-courses" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold hover:bg-secondary transition-colors duration-200">
                  Browse courses <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                <div><span className="font-mono text-2xl font-semibold text-foreground tabular-nums">12,400+</span><br />Readers</div>
                <div className="h-8 w-px bg-border" />
                <div><span className="font-mono text-2xl font-semibold text-foreground tabular-nums">4.9</span><br />Avg rating</div>
                <div className="h-8 w-px bg-border" />
                <div><span className="font-mono text-2xl font-semibold text-foreground tabular-nums">98%</span><br />On-time</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-[0_30px_60px_rgb(0,0,0,0.08)]">
                <img src="https://images.unsplash.com/photo-1630343710506-89f8b9f21d31?w=1200" alt="Reading in warm light" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block absolute -bottom-6 -left-8 w-56 bg-card border border-border rounded-2xl p-4 shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-2 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="mt-2 text-sm leading-snug">"The most careful bookstore on the internet."</p>
                <p className="mt-1 text-xs text-muted-foreground">— Rahul M.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-2xl border border-border p-8 bg-card hover:-translate-y-1 transition-transform duration-300">
              <f.icon className="w-6 h-6 text-primary" />
              <h3 className="mt-5 font-serif text-2xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY READ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Why read at all?</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl font-bold leading-tight">The quiet case for finishing a book.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">Reading is the highest-leverage habit we have. Twenty minutes a day compounds into a whole other person over a year.</p>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.n} className="rounded-2xl border border-border p-6 bg-card">
                <p className="font-mono text-xs text-muted-foreground">{b.n}</p>
                <h3 className="mt-2 font-serif text-xl font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">This week's shelf</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-bold leading-tight">Popular books.</h2>
          </div>
          <Link to="/books" className="hidden md:inline-flex items-center gap-1 text-sm link-underline" data-testid="see-all-books">
            See the whole shelf <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Customer letters</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl font-bold leading-tight max-w-2xl">Loved by readers who don't say that lightly.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border p-8 bg-card">
              <div className="flex items-center gap-1 text-primary">{[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-current" />)}</div>
              <p className="mt-5 leading-relaxed text-foreground/90">"{r.body}"</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-20">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Frequently asked</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl font-bold">Small print, big answers.</h2>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`i-${i}`} className="border-border" data-testid={`faq-${i}`}>
              <AccordionTrigger className="text-left font-serif text-lg">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        <div className="rounded-3xl bg-foreground text-background p-10 md:p-16 relative overflow-hidden">
          <BookOpen className="absolute -right-8 -bottom-8 w-56 h-56 text-background/5" />
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">One letter, once a week</p>
          <h2 className="mt-3 font-serif text-3xl md:text-5xl font-bold max-w-2xl leading-tight">The best books we read, and a paragraph on why.</h2>
          <form onSubmit={subscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              data-testid="newsletter-email"
              className="flex-1 rounded-full bg-background/10 border border-background/20 text-background placeholder:text-background/50 px-5 py-3 outline-none focus:border-primary"
            />
            <button data-testid="newsletter-submit" className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform duration-200">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
