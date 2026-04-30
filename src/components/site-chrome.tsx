import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/vybify-logo.png";

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Vybify logo" className="h-9 w-9 rounded-xl shadow-soft group-hover:scale-105 transition-transform" />
          <span className="font-display text-2xl font-semibold tracking-tight">Vybify</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <Link to="/" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }} className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">About</Link>
          <Link to="/how-it-works" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">How it works</Link>
          {user && <Link to="/history" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">History</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {!loading && (user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/app">Open app</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-gradient-sunset text-white border-0 shadow-soft hover:opacity-90">
                <Link to="/login">Try Vybify</Link>
              </Button>
            </>
          ))}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/40 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Vybify logo" className="h-6 w-6 rounded-lg" />
          <span className="font-display text-lg text-foreground">Vybify</span>
        </div>
        <p>© {new Date().getFullYear()} Vybify · made for the vibes ✨</p>
      </div>
    </footer>
  );
}
