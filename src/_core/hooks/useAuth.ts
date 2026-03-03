import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
  openId: string;
} | null;

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const qc = useQueryClient();
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (profile) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          name: profile.name ?? session.user.email ?? "",
          role: profile.role ?? "client",
          openId: session.user.id,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        qc.setQueryData(["auth.me"], null);
        setLoading(false);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email ?? "",
            name: profile.name ?? session.user.email ?? "",
            role: profile.role ?? "client",
            openId: session.user.id,
          };
          setUser(authUser);
          qc.setQueryData(["auth.me"], authUser);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [qc]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    qc.setQueryData(["auth.me"], null);
    qc.clear();
    window.location.href = "/login";
  }, [qc]);

  const state = useMemo(() => ({
    user,
    loading,
    error: null as Error | null,
    isAuthenticated: Boolean(user),
  }), [user, loading]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, state.user]);

  return {
    ...state,
    refresh: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUser(null); return; }
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single();
      if (profile) {
        setUser({ id: session.user.id, email: session.user.email ?? "", name: profile.name ?? "", role: profile.role ?? "client", openId: session.user.id });
      }
    },
    logout,
  };
}
