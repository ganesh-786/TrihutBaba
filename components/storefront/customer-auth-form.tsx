"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/ui/toaster";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function CustomerAuthForm({ locale }: { locale: string }) {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/${locale}/account`
                : undefined,
          },
        });
        if (error) throw error;
        showToast({
          title: "Account created",
          description: "Check your email to confirm your address.",
          variant: "success",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = `/${locale}/account`;
      }
    } catch (err) {
      showToast({
        title: "Failed",
        description: err instanceof Error ? err.message : "",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex rounded-md border p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded py-1.5 ${
            mode === "login" ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          {locale === "ne" ? "लग इन" : "Log in"}
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded py-1.5 ${
            mode === "signup" ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          {locale === "ne" ? "साइन अप" : "Sign up"}
        </button>
      </div>

      {mode === "signup" && (
        <div className="space-y-1.5">
          <Label htmlFor="name">{locale === "ne" ? "नाम" : "Full name"}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading
          ? "..."
          : mode === "login"
            ? locale === "ne"
              ? "लग इन"
              : "Log in"
            : locale === "ne"
              ? "खाता बनाउनुहोस्"
              : "Create account"}
      </Button>
    </form>
  );
}
