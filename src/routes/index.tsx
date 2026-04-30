import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Music, Camera, Heart, Wand2, Share2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-foreground/80 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered vibe-to-music magic
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
            What song should <br className="hidden sm:block" />
            <span className="text-gradient-sunset italic">your story</span> have?
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground">
            Drop a photo. Vybify reads the mood, the light, the whole vibe — and matches it to the perfect Hindi or English song. Aesthetic. Instant. ✨
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-gradient-sunset text-white border-0 shadow-dreamy hover:opacity-95 px-8 h-12">
              <Link to="/app">Find my song</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full h-12 px-6">
              <Link to="/how-it-works">How it works →</Link>
            </Button>
          </div>
        </div>

        {/* Floating mockup */}
        <div className="relative mt-16 sm:mt-20 mx-auto max-w-3xl">
          <div className="absolute -inset-10 bg-gradient-dreamy opacity-40 blur-3xl rounded-full" />
          <div className="relative glass-strong rounded-3xl p-6 sm:p-8 shadow-dreamy">
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-sunset shadow-soft relative overflow-hidden">
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 text-sm">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Detected vibe</div>
                  <div className="font-display text-lg font-medium">Golden hour · romantic · low energy</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Best pick</div>
                <div>
                  <div className="font-display text-2xl font-semibold">Tum Hi Ho</div>
                  <div className="text-sm text-muted-foreground">Arijit Singh</div>
                </div>
                <p className="text-sm text-muted-foreground italic">"that warm light + slow energy = peak Arijit slowcore moment 💛"</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="rounded-full bg-secondary/60 text-secondary-foreground text-xs px-3 py-1">#sunsetdiaries</span>
                  <span className="rounded-full bg-accent/60 text-accent-foreground text-xs px-3 py-1">#aesthetic</span>
                  <span className="rounded-full bg-primary/20 text-foreground text-xs px-3 py-1">#vybify</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold">Made for the <span className="italic text-gradient-sunset">vibes</span></h2>
          <p className="mt-3 text-muted-foreground">Everything you need to soundtrack your moment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Camera, title: "Multi-photo vibe read", text: "Drop one or many photos — Vybify finds the dominant overall mood." },
            { icon: Music, title: "Hindi + English + lo-fi", text: "Real, trending, story-friendly songs across vocal & instrumental." },
            { icon: Wand2, title: "Captions on tap", text: "Get an aesthetic caption + hashtags ready to paste." },
            { icon: Heart, title: "Save your vibe history", text: "Every analysis stays in your history so you can revisit a mood." },
            { icon: Share2, title: "Spotify & YouTube ready", text: "One-tap to open the song wherever you stream." },
            { icon: Sparkles, title: "Built for Gen-Z taste", text: "No generic suggestions. We match feeling, not just genre." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass rounded-2xl p-6 hover:shadow-soft transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-sunset text-white shadow-soft mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-medium mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-gradient-sunset p-10 sm:p-14 text-center shadow-dreamy">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">Your next story deserves better music.</h2>
          <p className="mt-3 text-white/85">Try Vybify free. Takes 5 seconds.</p>
          <Button asChild size="lg" className="mt-7 rounded-full bg-white text-foreground hover:bg-white/90 h-12 px-8">
            <Link to="/login">Get started →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
