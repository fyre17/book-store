import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { motion } from "framer-motion";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("latest");
  const [range, setRange] = useState([0, 3000]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/books/categories").then((r) => setCats(["All", ...r.data])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/books", { params: { q, category: cat, sort, min_price: range[0], max_price: range[1] } })
      .then((r) => setBooks(r.data))
      .finally(() => setLoading(false));
  }, [q, cat, sort, range]);

  const priceMax = useMemo(() => 3000, []);

  return (
    <>
      <section className="warm-gradient border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">The library</p>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl font-bold leading-tight">Books, curated slowly.</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">Every title on the shelf earned its spot. Browse the whole collection.</p>
        </div>
      </section>

      {/* Mobile filter toolbar */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or author"
          data-testid="books-search-mobile"
          className="w-full min-h-[44px] rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} data-testid={`cat-m-${c.toLowerCase()}`}
              className={`shrink-0 text-xs rounded-full px-4 py-2 border min-h-[36px] transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
              {c}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="sort-select-mobile"
          className="w-full min-h-[44px] rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
          <option value="latest">Sort · Latest</option>
          <option value="popular">Sort · Most Popular</option>
          <option value="price_asc">Sort · Price low to high</option>
          <option value="price_desc">Sort · Price high to low</option>
        </select>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-border p-6 bg-card space-y-6">
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  <Search className="w-3.5 h-3.5" /> Search
                </label>
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Title or author"
                  data-testid="books-search"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Category
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cats.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      data-testid={`cat-${c.toLowerCase()}`}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-colors duration-200 ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Max price</p>
                <input
                  type="range" min={0} max={priceMax} step={100}
                  value={range[1]} onChange={(e) => setRange([0, Number(e.target.value)])}
                  data-testid="price-range"
                  className="mt-3 w-full accent-primary"
                />
                <p className="mt-1 font-mono text-sm tabular-nums">₹0 – ₹{range[1]}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Sort</p>
                <select
                  value={sort} onChange={(e) => setSort(e.target.value)}
                  data-testid="sort-select"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <p className="text-sm text-muted-foreground"><span className="tabular-nums font-medium text-foreground">{books.length}</span> books</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border h-72 sm:h-96 animate-pulse bg-secondary/50" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <p className="font-serif text-2xl">No books match.</p>
                <p className="text-muted-foreground mt-2">Try a different category or search.</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {books.map((b, i) => (
                  <motion.div key={b.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}>
                    <BookCard book={b} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
