import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Music } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Vybify" }, { name: "description", content: "Your saved vibes and song picks." }] }),
  component: HistoryPage,
});

interface VibeRow {
  id: string; image_url: string; vibe_summary: string | null;
  mood: string | null; energy: string | null;
  best_pick: { name: string; artist: string; why: string } | null;
  created_at: string;
}

function HistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<VibeRow[] | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/history" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("vibes").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else setRows((data as any) || []);
    });
  }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("vibes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r?.filter((x) => x.id !== id) ?? null);
  };

  if (loading || !user || rows === null) {
    return <div className="h-[60vh] flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">Your <span className="text-gradient-sunset italic">vibe history</span></h1>
          <p className="mt-2 text-muted-foreground">{rows.length} saved {rows.length === 1 ? "vibe" : "vibes"}</p>
        </div>
        <Button asChild className="rounded-full bg-gradient-sunset text-white border-0">
          <Link to="/app">+ New vibe</Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center shadow-soft">
          <p className="text-muted-foreground">No vibes yet — go drop your first photo ✨</p>
          <Button asChild className="mt-5 rounded-full bg-gradient-sunset text-white border-0">
            <Link to="/app">Find a song</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((r) => (
            <div key={r.id} className="glass-strong rounded-3xl overflow-hidden shadow-soft group">
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => remove(r.id)} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                <p className="font-display text-lg leading-snug mt-1 line-clamp-2">{r.vibe_summary}</p>
                {r.best_pick && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="font-medium truncate">{r.best_pick.name}</span>
                    <span className="text-muted-foreground truncate">— {r.best_pick.artist}</span>
                  </div>
                )}
                <div className="flex gap-1.5 mt-3">
                  {r.mood && <span className="rounded-full bg-primary/15 text-xs px-2.5 py-0.5">{r.mood}</span>}
                  {r.energy && <span className="rounded-full bg-secondary/60 text-xs px-2.5 py-0.5">{r.energy}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
