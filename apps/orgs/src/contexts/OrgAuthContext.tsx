"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@kifolio/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { orgsApi } from "@/lib/paths";

interface OrgAuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (payload: {
    email: string;
    password: string;
    orgName: string;
    slug?: string;
    displayName?: string;
  }) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const OrgAuthContext = createContext<OrgAuthContextType | undefined>(undefined);

export function OrgAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signUp: OrgAuthContextType["signUp"] = async (payload) => {
    try {
      const response = await fetch(orgsApi("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || "Signup failed" };
      }
      return {
        needsEmailConfirmation: Boolean(data.needsEmailConfirmation),
      };
    } catch {
      return { error: "An unexpected error occurred" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(orgsApi("/api/auth/sign-in"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        await supabase.auth.signOut();
        setUser(null);
        return { error: data.error || "Sign in failed" };
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      return {};
    } catch {
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <OrgAuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut }}
    >
      {children}
    </OrgAuthContext.Provider>
  );
}

export function useOrgAuth() {
  const context = useContext(OrgAuthContext);
  if (!context) {
    throw new Error("useOrgAuth must be used within OrgAuthProvider");
  }
  return context;
}
