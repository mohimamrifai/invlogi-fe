"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore, syncAuthTokenWithStore } from "@/lib/store";
import { getStoredToken } from "@/lib/api-client";
import { profileRequest } from "@/lib/auth-api";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthPersistHydrated();
  const { user, setUser, clearSession } = useAuthStore();

  useEffect(() => {
    syncAuthTokenWithStore();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) {
      profileRequest()
        .then((res) => setUser(res.data))
        .catch(() => {
          clearSession();
          router.replace("/login");
        });
    }
  }, [hydrated, user, setUser, clearSession, router]);

  if (!hydrated || !getStoredToken() || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Memuat sesi…
      </div>
    );
  }

  return <>{children}</>;
}
