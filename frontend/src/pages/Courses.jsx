import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { motion } from "framer-motion";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/courses", { params: { q } }).then((r) => setCourses(r.data));
  }, [q]);

  return (
    <>
      <section className="warm-gradient border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Studio-grade courses</p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl font-bold leading-tight">Courses that finish what<br />books started.</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">Live cohorts, patient teachers, and syllabi we'd take ourselves.</p>
          <div className="mt-8 max-w-md">
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses"
              data-testid="courses-search"
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}>
              <BookCard book={c} type="course" />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
