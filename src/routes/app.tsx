import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Sparkles, Music, Copy, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Vybify" }, { name: "description", content: "Upload a photo. Get the perfect song." }] }),
  component: AppPage,
});

interface Song { name: string; artist: string; why: string; }
interface VibeResult {
  vibe_summary: string; mood: string; energy: string; context: string; style: string;
  hindi_vocal: Song[]; english_vocal: Song[]; instrumental: Song[];
  best_pick: Song; caption: string; hashtags: string[];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function AppPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<VibeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/app" } });
  }, [loading, user, navigate]);

  const onFiles = async (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, 4);
    const previews = await Promise.all(arr.map(async (f) => ({ file: f, preview: await fileToDataUrl(f) })));
    setFiles((prev) => [...prev, ...previews].slice(0, 4));
  };

  const removeFile = (i: number) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const analyze = async () => {
    if (!files.length || !user) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const dataUrls = files.map((f) => f.preview);
      const { data, error } = await supabase.functions.invoke("analyze-vibe", {
        body: { images: dataUrls },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as VibeResult);

      // upload first image and save vibe history
      try {
        const file = files[0].file;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("vybify-images").upload(path, file, { upsert: false });
        if (!upErr) {
          const { data: pub } = supabase.storage.from("vybify-images").getPublicUrl(path);
          await supabase.from("vibes").insert({
            user_id: user.id,
            image_url: pub.publicUrl,
            vibe_summary: data.vibe_summary,
            mood: data.mood, energy: data.energy, context: data.context, style: data.style,
            recommendations: { hindi_vocal: data.hindi_vocal, english_vocal: data.english_vocal, instrumental: data.instrumental },
            best_pick: data.best_pick,
            caption: data.caption,
            hashtags: data.hashtags,
          });
        }
      } catch (e) {
        console.warn("save vibe failed", e);
      }
    } catch (e: any) {
      toast.error(e.message || "Could not analyze vibe");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); };

  if (loading || !user) {
    return <div className="h-[60vh] flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold">Drop your <span className="text-gradient-sunset italic">vibe</span></h1>
        <p className="mt-2 text-muted-foreground">Upload up to 4 photos. We'll find the song.</p>
      </div>

      {!result && (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-soft">
          {files.length === 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center gap-3 text-muted-foreground"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-sunset flex items-center justify-center text-white shadow-soft">
                <Upload className="h-6 w-6" />
              </div>
              <div className="font-display text-xl text-foreground">Tap to upload</div>
              <div className="text-sm">JPG, PNG · up to 4 photos</div>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-soft group">
                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(i)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length < 4 && (
                  <button onClick={() => inputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary flex items-center justify-center transition">
                    <Upload className="h-6 w-6" />
                  </button>
                )}
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            className="sr-only"
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          />

          {files.length > 0 && (
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="ghost" onClick={reset} disabled={analyzing}>Clear</Button>
              <Button onClick={analyze} disabled={analyzing} className="rounded-full bg-gradient-sunset text-white border-0 px-8 h-12 shadow-dreamy">
                {analyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Reading the vibe...</> : <><Sparkles className="h-4 w-4 mr-2" /> Find my song</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {result && (
        <ResultView result={result} previews={files.map((f) => f.preview)} onReset={reset} />
      )}
    </div>
  );
}

function SongRow({ s }: { s: Song }) {
  const q = encodeURIComponent(`${s.name} ${s.artist}`);
  return (
    <div className="rounded-2xl glass p-4 hover:shadow-soft transition group">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-sunset flex items-center justify-center text-white shrink-0">
          <Music className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg font-medium leading-tight">{s.name}</div>
          <div className="text-sm text-muted-foreground">{s.artist}</div>
          <div className="text-xs text-muted-foreground mt-1.5 italic">"{s.why}"</div>
          <div className="flex gap-2 mt-3">
            <a href={`https://open.spotify.com/search/${q}`} target="_blank" rel="noreferrer" className="text-xs rounded-full bg-sage/40 px-3 py-1 hover:bg-sage/60 transition">Spotify</a>
            <a href={`https://music.youtube.com/search?q=${q}`} target="_blank" rel="noreferrer" className="text-xs rounded-full bg-rose/40 px-3 py-1 hover:bg-rose/60 transition">YT Music</a>
            <a href={`https://www.youtube.com/results?search_query=${q}`} target="_blank" rel="noreferrer" className="text-xs rounded-full bg-lavender/50 px-3 py-1 hover:bg-lavender/70 transition">YouTube</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultView({ result, previews, onReset }: { result: VibeResult; previews: string[]; onReset: () => void }) {
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied ✨"); };
  const q = encodeURIComponent(`${result.best_pick.name} ${result.best_pick.artist}`);

  return (
    <div className="space-y-6">
      {/* Vibe summary + image */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-dreamy">
        <div className="grid sm:grid-cols-[200px_1fr] gap-6 items-start">
          <div className="grid grid-cols-2 gap-2">
            {previews.slice(0, 4).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-xl shadow-soft" />
            ))}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Detected vibe</div>
            <p className="font-display text-2xl sm:text-3xl mt-1 leading-snug">{result.vibe_summary}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="rounded-full bg-primary/15 text-foreground text-xs px-3 py-1">mood: {result.mood}</span>
              <span className="rounded-full bg-secondary/60 text-secondary-foreground text-xs px-3 py-1">energy: {result.energy}</span>
              <span className="rounded-full bg-accent/60 text-accent-foreground text-xs px-3 py-1">{result.context}</span>
              <span className="rounded-full bg-sage/40 text-xs px-3 py-1">{result.style}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best pick */}
      <div className="rounded-3xl bg-gradient-sunset p-6 sm:p-8 text-white shadow-dreamy">
        <div className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Best pick</div>
        <div className="font-display text-4xl sm:text-5xl font-semibold mt-2">{result.best_pick.name}</div>
        <div className="text-lg opacity-90">{result.best_pick.artist}</div>
        <p className="mt-3 italic opacity-90">"{result.best_pick.why}"</p>
        <div className="flex flex-wrap gap-2 mt-5">
          <a href={`https://open.spotify.com/search/${q}`} target="_blank" rel="noreferrer" className="rounded-full bg-white text-foreground text-sm px-5 py-2 font-medium hover:bg-white/90">Open in Spotify</a>
          <a href={`https://music.youtube.com/search?q=${q}`} target="_blank" rel="noreferrer" className="rounded-full bg-white/20 backdrop-blur text-white text-sm px-5 py-2 font-medium hover:bg-white/30">YT Music</a>
        </div>
      </div>

      {/* Categories */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Section title="🎤 Hindi Vocal" songs={result.hindi_vocal} />
        <Section title="🎙 English Vocal" songs={result.english_vocal} />
        <Section title="🎧 Instrumental / Lo-fi" songs={result.instrumental} />
      </div>

      {/* Caption */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-soft">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Story caption</div>
        <p className="font-display text-2xl mt-2">{result.caption}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {result.hashtags.map((h) => (
            <span key={h} className="rounded-full bg-secondary/60 text-secondary-foreground text-xs px-3 py-1">#{h.replace(/^#/, "")}</span>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => copy(result.caption)}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy caption
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => copy(result.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" "))}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy hashtags
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <Button onClick={onReset} className="rounded-full bg-gradient-sunset text-white border-0 px-8 h-12 shadow-dreamy">
          Try another vibe
        </Button>
        <Button asChild variant="outline" className="rounded-full h-12 px-6">
          <Link to="/history">My history</Link>
        </Button>
      </div>
    </div>
  );
}

function Section({ title, songs }: { title: string; songs: Song[] }) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl">{title}</h3>
      {songs.map((s, i) => <SongRow key={i} s={s} />)}
    </div>
  );
}
