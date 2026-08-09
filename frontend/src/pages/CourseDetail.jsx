import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, mediaUrl, PLACEHOLDER } from "@/lib/api";
import { ArrowLeft, ArrowRight, Clock, Globe2, ShieldCheck, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setCourse(null); setNotFound(false);
    api.get(`/courses/${id}`).then((r) => setCourse(r.data)).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return (
    <section className="max-w-2xl mx-auto px-4 py-32 text-center">
      <h1 className="font-serif text-4xl font-bold">Course not found.</h1>
      <Link to="/courses" className="mt-6 inline-flex items-center gap-1 text-sm link-underline"><ArrowLeft className="w-4 h-4" /> Back to courses</Link>
    </section>
  );

  if (!course) return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-14">
      <div className="aspect-[16/9] rounded-3xl bg-secondary animate-pulse" />
    </section>
  );

  const unit = course.offer_price || course.price;
  const hasOffer = course.offer_price && course.offer_price < course.price;
  const off = hasOffer ? Math.round(((course.price - course.offer_price) / course.price) * 100) : 0;
  const buy = () => nav("/checkout", { state: { item: course, type: "course", quantity: 1 } });

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        <Link to="/courses" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" data-testid="back-to-courses">
          <ArrowLeft className="w-3.5 h-3.5" /> All courses
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative aspect-[21/9] rounded-3xl overflow-hidden border border-border bg-secondary shadow-[0_30px_60px_rgb(0,0,0,0.08)]">
          <img src={mediaUrl(course.image)} alt={course.title}
            onError={(e) => { if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER; }}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-background">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary-foreground/90">Studio course</p>
            <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold leading-tight max-w-3xl">{course.title}</h1>
          </div>
          {hasOffer && (
            <span className="absolute top-6 right-6 text-xs uppercase tracking-widest font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
              {off}% off
            </span>
          )}
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <p className="text-lg leading-relaxed text-foreground/90">{course.description}</p>

            <div className="grid sm:grid-cols-3 gap-4">
              <Meta icon={Clock} label="Duration" value={course.duration || "Self-paced"} />
              <Meta icon={Globe2} label="Language" value={course.language} />
              <Meta icon={Award} label="Access" value="Lifetime" />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-3xl border border-border p-6 bg-card sticky top-24">
              <div className="flex items-baseline gap-3">
                <p className="font-mono text-3xl font-semibold tabular-nums">₹{unit}</p>
                {hasOffer && <p className="font-mono text-sm text-muted-foreground line-through tabular-nums">₹{course.price}</p>}
              </div>
              <button onClick={buy} data-testid="det-buy"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform duration-200">
                Enroll now <ArrowRight className="w-4 h-4" />
              </button>
              <div className="mt-6 pt-6 border-t border-border space-y-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure UPI checkout</p>
                <p className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-primary" /> Lifetime access + updates</p>
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary" /> Start immediately</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

const Meta = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-border p-5 bg-card">
    <Icon className="w-5 h-5 text-primary" />
    <p className="mt-3 text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value}</p>
  </div>
);
