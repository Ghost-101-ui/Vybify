import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-3xl p-10 shadow-soft">
        <h1 className="font-display text-7xl font-semibold text-gradient-sunset">404</h1>
        <h2 className="mt-4 font-display text-2xl font-medium">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page drifted off into the aesthetic ether.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-sunset px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vybify — find the perfect song for your story" },
      { name: "description", content: "Upload a photo and Vybify finds the perfect Hindi & English song for your Instagram story. AI-powered vibe-to-music in seconds." },
      { property: "og:title", content: "Vybify — find the perfect song for your story" },
      { property: "og:description", content: "Upload a photo and Vybify finds the perfect Hindi & English song for your Instagram story. AI-powered vibe-to-music in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vybify — find the perfect song for your story" },
      { name: "twitter:description", content: "Upload a photo and Vybify finds the perfect Hindi & English song for your Instagram story. AI-powered vibe-to-music in seconds." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/42f2c7bd-1556-47d5-b5a8-4465cd9e3eb6/id-preview-b0706e0c--a15423e1-8043-4028-b9a1-1992a352bde9.lovable.app-1777571723893.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/42f2c7bd-1556-47d5-b5a8-4465cd9e3eb6/id-preview-b0706e0c--a15423e1-8043-4028-b9a1-1992a352bde9.lovable.app-1777571723893.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
