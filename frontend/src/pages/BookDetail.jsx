import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, mediaUrl, PLACEHOLDER } from "@/lib/api";
import { pushRecent, toggleWishlist, isWished } from "@/lib/cart";
import { Heart, Star, ShieldCheck, Truck, ArrowLeft, ArrowRight, Package } from "lucide-react";
import { toast } from "sonner";
import BookCard from "@/components/BookCard";
import { motion } from "framer-motion";

export default function BookDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setBook(null); setNotFound(false);
    api.get(`/books/${id}`).then((r) => {
      setBook(r.data); pushRecent(id); setWished(isWished(id));
      api.get("/books", { params: { category: r.data.category } })
        .then((rr) => setRelated(rr.data.filter((b) => b.id !== id).slice(0, 4)));
    }).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return (
    <section className="max-w-2xl mx-auto px-4 py-32 text-center">
      <h1 className="font-serif text-4xl font-bold">Book not found.</h1>
      <Link to="/books" className="mt-6 inline-flex items-center gap-1 text-sm link-underline">
        <ArrowLeft className="w-4 h-4" /> Back to books
      </Link>
    </section>
  );

  if (!book) return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-14">
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 aspect-[4/5] rounded-3xl bg-secondary animate-pulse" />
        <div className="lg:col-span-6 space-y-4">
          <div className="h-8 w-24 bg-secondary animate-pulse rounded" />
          <div className="h-12 w-3/4 bg-secondary animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-secondary animate-pulse rounded" />
          <div className="h-32 w-full bg-secondary animate-pulse rounded" />
        </div>
      </div>
    </section>
  );

  const unit = book.offer_price || book.price;
  const hasOffer = book.offer_price && book.offer_price < book.price;
  const off = hasOffer ? Math.round(((book.price - book.offer_price) / book.price) * 100) : 0;
  const total = unit * qty;

  const onWish = () => { toggleWishlist(book.id); setWished((w) => !w); toast.success(wished ? "Removed from wishlist" : "Saved to wishlist"); };
  const buy = () => nav("/checkout", { state: { item: book, type: "book", quantity: qty } });

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        <Link to="/books" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" data-testid="back-to-books">
          <ArrowLeft className="w-3.5 h-3.5" /> All books
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="lg:col-span-6">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border bg-secondary shadow-[0_30px_60px_rgb(0,0,0,0.08)]">
            <img src={mediaUrl(book.image)} alt={book.title}
              onError={(e) => { if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER; }}
              className="w-full h-full object-cover" />
            {hasOffer && (
              <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
                {off}% OFF
              </span>
            )}
          </div>
        </motion.div>

        <div className="lg:col-span-6">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">{book.category}</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold leading-tight">{book.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">by {book.author}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(book.rating) ? "fill-current" : "opacity-30"}`} />)}
            </div>
            <span className="font-mono text-sm tabular-nums">{book.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {book.stock > 0 ? `${book.stock} in stock` : "Sold out"}
            </span>
          </div>

          <div className="mt-8 flex items-baseline gap-4">
            <p className="font-mono text-4xl md:text-5xl font-semibold tabular-nums">₹{unit}</p>
            {hasOffer && <p className="font-mono text-lg text-muted-foreground line-through tabular-nums">₹{book.price}</p>}
          </div>

          <p className="mt-8 text-foreground/90 leading-relaxed text-lg">{book.description || "A carefully chosen title from our library."}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="det-qty-minus" className="w-9 h-9 rounded-full hover:bg-secondary">−</button>
              <span className="w-10 text-center font-mono tabular-nums" data-testid="det-qty">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} data-testid="det-qty-plus" className="w-9 h-9 rounded-full hover:bg-secondary">+</button>
            </div>
            <button onClick={buy} disabled={book.stock === 0} data-testid="det-buy"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold hover:scale-[1.02] hover:shadow-[0_20px_40px_rgb(217,93,57,0.25)] transition-[transform,box-shadow] duration-300 disabled:opacity-50 disabled:hover:scale-100">
              Buy now · ₹{total} <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onWish} data-testid="det-wish"
              className="w-11 h-11 rounded-full border border-border grid place-items-center hover:bg-secondary transition-colors">
              <Heart className={`w-4 h-4 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border p-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="mt-3 text-sm font-semibold">Secure UPI checkout</p>
              <p className="mt-1 text-xs text-muted-foreground">PhonePe · GPay · Paytm · Any UPI app</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <Truck className="w-5 h-5 text-primary" />
              <p className="mt-3 text-sm font-semibold">Ships in 24 hours</p>
              <p className="mt-1 text-xs text-muted-foreground">India-wide delivery, tracked</p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">More from {book.category}</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-bold">You might also like.</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </>
  );
}
