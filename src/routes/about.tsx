import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Vybify" },
      { name: "description", content: "Vybify turns your photos into the perfect story soundtrack using AI. Built for Gen-Z taste." },
      { property: "og:title", content: "About Vybify" },
      { property: "og:description", content: "AI vibe-to-music for the aesthetic generation." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
      <h1 className="font-display text-5xl font-semibold">About Vybify</h1>
      <div className="mt-8 space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>
          Picking the right song for an Instagram story is harder than writing the caption. You scroll, you preview, you abandon it. Vybify fixes that.
        </p>
        <p>
          We built an AI that <span className="text-foreground font-medium">actually looks at your photo</span> — the mood, the light, the people, the place — and matches it to a real, trending song you'll actually want to use.
        </p>
        <p>
          No fake songs. No generic suggestions. Just vibes, instantly translated into music.
        </p>
        <p className="font-display italic text-2xl text-foreground pt-4">
          Made for people who care how their moment sounds. ✨
        </p>
      </div>
      <Link to="/app" className="inline-flex mt-10 rounded-full bg-gradient-sunset text-white px-7 h-12 items-center font-medium shadow-dreamy">
        Try Vybify →
      </Link>
    </div>
  );
}
