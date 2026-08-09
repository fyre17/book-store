import { useState, useRef } from "react";
import { api, mediaUrl } from "@/lib/api";
import { Upload, RefreshCcw, Trash2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const ACCEPTED = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_MB = 10;

/**
 * Admin image upload with preview + replace + delete.
 * Value/onChange handle the URL stored on the parent form (public API path like /api/files/...).
 */
export default function ImageUpload({ value, onChange, label = "Image", folder = "products", testid = "img" }) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED.split(",").includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WEBP image");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_MB} MB`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    setBusy(true);
    try {
      const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(res.data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally { setBusy(false); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => { onChange(""); toast.info("Image removed. Remember to save."); };

  if (value) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</p>
        <div className="mt-2 rounded-xl border border-border overflow-hidden bg-secondary/40">
          <div className="relative aspect-[4/3] bg-secondary">
            <img
              src={mediaUrl(value)}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
            />
            {busy && (
              <div className="absolute inset-0 bg-background/70 grid place-items-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="p-2 flex gap-2 border-t border-border">
            <button type="button" onClick={() => ref.current?.click()} data-testid={`${testid}-replace`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 hover:bg-secondary transition-colors">
              <RefreshCcw className="w-3.5 h-3.5" /> Replace
            </button>
            <button type="button" onClick={removeImage} data-testid={`${testid}-delete`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-destructive rounded-lg px-3 py-2 hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
        <input ref={ref} type="file" accept={ACCEPTED} className="hidden"
          data-testid={`${testid}-file`}
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</p>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        htmlFor={`${testid}-input`}
        className={`mt-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors ${drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-secondary/60"}`}
      >
        {busy ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
        <p className="text-sm font-medium">
          <span className="text-primary">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to {MAX_MB} MB</p>
        <input id={`${testid}-input`} type="file" accept={ACCEPTED} className="hidden"
          data-testid={`${testid}-file`}
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>
    </div>
  );
}
