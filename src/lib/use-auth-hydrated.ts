"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";

/**
 * true setelah zustand persist selesai baca localStorage.
 * Tanpa ini, render pertama setelah mount sering masih user === null
 * sehingga pengecekan role (mis. super_admin) salah.
 */
export function useAuthPersistHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== "undefined" ? useAuthStore.persist.hasHydrated() : false
  );

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
}
