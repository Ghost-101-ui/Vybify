import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Sign in — Vybify" }, { name: "description", content: "Sign in to Vybify and save your vibe history." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  // already signed in? redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: search.redirect || "/app" });
    });
  }, [navigate, search.redirect]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account ✨");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back ✨");
        navigate({ to: search.redirect || "/app" });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
      if (result.error) { toast.error("Google sign-in failed"); return; }
      if (result.redirected) return;
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <div className="glass-strong rounded-3xl p-8 shadow-dreamy">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-sunset flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-2xl font-semibold">Vybify</span>
        </div>
        <h1 className="font-display text-3xl font-semibold mt-4">Welcome ✨</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to save your vibes.</p>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mt-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value={mode} className="mt-5">
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="aesthetic.you" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@vybe.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-sunset text-white border-0 h-11">
                {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <div className="relative my-5 text-center text-xs text-muted-foreground">
              <span className="relative z-10 bg-card px-3">or</span>
              <div className="absolute inset-0 top-1/2 h-px bg-border" />
            </div>
            <Button onClick={onGoogle} disabled={busy} variant="outline" className="w-full rounded-full h-11">
              Continue with Google
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
