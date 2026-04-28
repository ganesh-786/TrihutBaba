"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toaster";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ locale }: { locale: string }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = `/${locale}/admin/dashboard`;
    } catch (err) {
      showToast({
        title: "Sign-in failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading} size="lg">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Admin accounts are created in Supabase, with{" "}
        <code className="rounded bg-muted px-1">role=admin</code> in the users table.
      </p>
    </form>
  );
}
