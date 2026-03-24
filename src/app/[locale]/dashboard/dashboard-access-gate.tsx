"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/lib/store";
import { evaluateDashboardPathAccess } from "@/lib/dashboard-access";

export function DashboardAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setAllowed(null);
      return;
    }
    const violation = evaluateDashboardPathAccess(user, pathname);
    if (violation) {
      setAllowed(false);
      router.replace(violation.redirectTo);
      return;
    }
    setAllowed(true);
  }, [user, pathname, router]);

  if (!user || allowed === null || allowed === false) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Memuat sesi…
      </div>
    );
  }

  return <>{children}</>;
}
