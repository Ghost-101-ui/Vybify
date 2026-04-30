import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Vybify" },
      { name: "description", content: "Three steps from photo to perfect story song. Upload, vibe-check, post." },
      { property: "og:title", content: "How Vybify works" },
      { property: "og:description", content: "Photo → AI vibe analysis → real song picks. In seconds." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { n: "01", title: "Upload your photo", text: "Drop one image or a few. Selfies, sunsets, gym, café — anything." },
  { n: "02", title: "AI reads the vibe", text: "Mood, scene, energy, lighting, context. The whole feeling." },
  { n: "03", title: "Get your song", text: "Real Hindi + English picks, lo-fi options, plus a caption + hashtags." },
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20">
      <h1 className="font-display text-5xl font-semibold">How it works</h1>
      <p className="mt-3 text-lg text-muted-foreground">Three steps. Five seconds. Pure vibes.</p>
      <div className="mt-12 space-y-5">
        {steps.map((s) => (
          <div key={s.n} className="glass-strong rounded-3xl p-8 flex gap-6 items-start shadow-soft">
            <div className="font-display text-5xl text-gradient-sunset font-semibold leading-none">{s.n}</div>
            <div>
              <h3 className="font-display text-2xl font-medium">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/app" className="inline-flex rounded-full bg-gradient-sunset text-white px-8 h-12 items-center font-medium shadow-dreamy">
          Try it now →
        </Link>
      </div>
    </div>
  );
}
