import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { toggleWishlist, isWished } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";

export default function BookCard({ book, type = "book" }) {
  const [wished, setWished] = useState(isWished(book.id));
  const price = book.offer_price || book.price;
  const hasOffer = book.offer_price && book.offer_price < book.price;
  const off = hasOffer ? Math.round(((book.price - book.offer_price) / book.price) * 100) : 0;

  const onWish = (e) => {
    e.preventDefault();
    toggleWishlist(book.id);
    setWished((w) => !w);
    toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div
      data-testid={`${type}-card-${book.id}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-[transform,box-shadow] duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={mediaUrl(book.image) || "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasOffer && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
            {off}% OFF
          </span>
        )}
        <button
          onClick={onWish}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur grid place-items-center hover:bg-background transition-colors"
          data-testid={`wishlist-${book.id}`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wished ? "fill-primary text-primary" : ""}`} />
        </button>
        {type === "book" && book.stock <= 5 && book.stock > 0 && (
          <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest font-bold bg-accent text-accent-foreground px-2.5 py-1 rounded-full">Only {book.stock} left</span>
        )}
        {type === "book" && book.stock === 0 && (
          <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest font-bold bg-destructive text-destructive-foreground px-2.5 py-1 rounded-full">Sold out</span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
          {type === "book" ? book.category : book.duration || "Course"}
        </p>
        <h3 className="mt-2 font-serif text-lg font-semibold leading-tight line-clamp-2">{book.title}</h3>
        {type === "book" && (
          <p className="mt-1 text-sm text-muted-foreground">by {book.author}</p>
        )}
        {type === "course" && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{book.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-primary">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium tabular-nums">{(book.rating || 4.5).toFixed(1)}</span>
          </div>
          {type === "course" && book.language && (
            <span className="text-xs text-muted-foreground">· {book.language}</span>
          )}
        </div>
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-lg font-semibold tabular-nums">₹{price}</p>
            {hasOffer && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">₹{book.price}</p>
            )}
          </div>
          <Link
            to="/checkout"
            state={{ item: book, type }}
            data-testid={`buy-now-${book.id}`}
            className="rounded-full px-4 py-2 text-xs font-semibold bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          >
            Buy now
          </Link>
        </div>
      </div>
    </div>
  );
}
